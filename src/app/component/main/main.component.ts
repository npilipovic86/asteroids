import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subscription, forkJoin } from 'rxjs';
import { delay, map, startWith } from 'rxjs/operators';
import { Asteroid } from '../../model/Asteroid';
import { AsteroidService } from '../../service/asteroid.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy {
   startDate;
   endDate;
  private allAsteroids: any;
  private matchAsteroids: any[] = [];
   asteroids: any[] = [];
  private sortRevers = true;
  private selectedAsteroids: Asteroid[] = [];

  public filteredItems: Observable<any[]>;
  public inputCtrl: FormControl;

  private subscription1: Subscription;
  private subscription2: Subscription;
  private asteroidsPage: Asteroid[];
  private page: number;

  constructor(private _service: AsteroidService, private router: Router) {}

  ngOnInit() {
    this.page = 1;
    this.autocomplete();
  }
  ngOnDestroy() {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
  }
  delete(item: Asteroid) {
    const index = this.selectedAsteroids.indexOf(item);
    this.selectedAsteroids.splice(index, 1);
  }

  sortTable(type: number) {
    this.sortRevers = !this.sortRevers;
    this.asteroidsPage.sort((a, b) => {
      let aa;
      let bb;
      if (type === 0) {
        aa = a.name.toLowerCase();
        bb = b.name.toLowerCase();
      } else if (type === 1) {
        aa = Math.round(a.kilometers_per_hour);
        bb = Math.round(b.kilometers_per_hour);
      } else if (type === 2) {
        aa = Math.round(a.estimated_diameter_min);
        bb = Math.round(b.estimated_diameter_min);
      } else if (type === 3) {
        aa = Math.round(a.estimated_diameter_max);
        bb = Math.round(b.estimated_diameter_max);
      } else {
        aa = a.close_approach_date
          .split('/')
          .reverse()
          .join('');
        bb = b.close_approach_date
          .split('/')
          .reverse()
          .join('');
      }
      if (this.sortRevers) {
        return aa > bb ? 1 : aa < bb ? -1 : 0;
      } else {
        return aa > bb ? -1 : aa < bb ? 1 : 0;
      }
    });
  }
  addSelected(asteroid: Asteroid) {
    this.inputCtrl.reset('');
    this.selectedAsteroids.push(asteroid);
  }
  autocomplete() {
    this.inputCtrl = new FormControl();
    this.filteredItems = this.inputCtrl.valueChanges.pipe(
      startWith(''),
      delay(1000),
      map(item => this.autocompleteFilter(item, this.asteroids))
    );
  }
  autocompleteFilter(name: string, listForFilter: any) {
    if (name.length >= 1) {
      return listForFilter.filter(
        item => item.name.toLowerCase().indexOf(name.toLowerCase()) === 0
      );
    } else {
      return [];
    }
  }
  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.changePage();
    }
  }
  nextPage() {
    if (this.page < this.numPages()) {
      this.page++;
      this.changePage();
    }
  }
  numPages() {
    return Math.ceil(this.asteroids.length / 10);
  }

  changePage() {
    if (this.page < 1) {
      this.page = 1;
    }
    if (this.page > this.numPages()) {
      this.page = this.numPages();
    }
    this.asteroidsPage = this.asteroids.slice((this.page - 1 ) * 10, this.page  * 10);
  }
  getChartData() {
    const observables: Array<Observable<any>> = this.selectedAsteroids.map(
      asteroid => {
        return this._service.getChartData(asteroid.self);
      }
    );

    const observable = forkJoin(...observables);

    this.subscription1 = observable.subscribe((res: any) => {
      res.forEach(asteroid => {
        let counter = 0;
        asteroid.close_approach_data.forEach(element => {
          if (   parseInt(element.close_approach_date.split('-')[0], 10) >= 1900 &&
            parseInt(element.close_approach_date.split('-')[0], 10) <= 1999 ) {
            counter++;
          }
        });
        asteroid.counter = counter;
      });
      console.log('list:', res);
      const asteroids = res.map( o => {
            console.log( o);
            return {
              name: o.name,
              counter: o.counter
            };
      });
      console.log('asteroids', asteroids);

      this._service.asteroidList = [...asteroids];
      // this._service.asteroidList = [...res];
      this.router.navigate(['/charts']);
    });
  }

  filterAsteroids() {
    const asteroidListObject = this.allAsteroids.near_earth_objects;

    Object.values(asteroidListObject).forEach(arrayObject => {
      Object.values(arrayObject).forEach(e => {
        if (e.is_potentially_hazardous_asteroid) {
          this.matchAsteroids.push(e);
        }
      });
    });

    this.asteroids = this.matchAsteroids.map(e => {
      console.log('eeeee' , e);
      return {
        self: e.links.self,
        close_approach_date: e.close_approach_data[0].close_approach_date,
        name: e.name,
        kilometers_per_hour:  e.close_approach_data[0].relative_velocity.kilometers_per_hour,
        estimated_diameter_min:   e.estimated_diameter.meters.estimated_diameter_min,
        estimated_diameter_max:  e.estimated_diameter.meters.estimated_diameter_max
      };
    });
    console.log( 'this.asteroids', this.asteroids);
    if (this.asteroids.length > 10) {
         this.asteroidsPage = this.asteroids.slice(0, 10);
    } else {
         this.asteroidsPage = this.asteroids;
    }
  }

  getData(startDate: string, endDate: string) {
    return this.subscription2 = this._service .getData(startDate, endDate).subscribe((res: any) => {
        this.allAsteroids = Object.assign({}, res);
        this.filterAsteroids();
      });
  }
  getAsteroids() {
    if (this.checkDate(this.startDate, this.endDate)) {
      this.getData(this.startDate, this.endDate);
    }
  }

  isValidDate(dateStr: string) {
    const datePat = /(\d{4})-(\d{2})-(\d{2})/;
    const matchArray = dateStr.match(datePat); // is the format ok?
    if (matchArray == null) {
      alert('Date must be in YYYY-MM-DD format');
      return false;
    }
    const month = parseInt(matchArray[2].replace(/(^|-)0+/g, '$1'), 10); // parse date into variables
    const day = parseInt(matchArray[3].replace(/(^|-)0+/g, '$1'), 10);
    const year = parseInt(matchArray[1], 10);

    if (year > 2300 || year < 1900) {
      alert('Year must be between 1900 and  2300');
      return false;
    }
    if (month < 1 || month > 12) {
      // check month range
      alert('Month must be between 1 and 12');
      return false;
    }
    if (day < 1 || day > 31) {
      alert('Day must be between 1 and 31');
      return false;
    }
    if (
      (month === 4 || month === 6 || month === 9 || month === 11) &&
      day === 31
    ) {
      alert('Month ' + month + ' doesn\'t have 31 days!');
      return false;
    }
    if (month === 2) {
      // check for february 29th
      const isleap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
      if (day > 29 || (day === 29 && !isleap)) {
        alert('February ' + year + ' doesn\'t have ' + day + ' days!');
        return false;
      }
    }
    return true; // date is valid
  }

  checkDate(startDate: string, endDate: string) {
    if ( startDate &&  endDate &&  this.isValidDate(startDate) &&
      this.isValidDate(endDate)  ) {
        const date1 = new Date(startDate);
        const date2 = new Date(endDate);
        const timeDiff = Math.abs(date2.getTime() - date1.getTime());
        const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        if (diffDays > 7) {
          alert('difference  between start and end date must be 7 days or less');
          return false;
        } else {
          return true;
        }
    } else {
      return false;
    }
  }
}
