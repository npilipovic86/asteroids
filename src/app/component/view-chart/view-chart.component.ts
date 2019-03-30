import { Component, OnInit } from '@angular/core';
import { AsteroidService } from 'src/app/service/asteroid.service';

@Component({
  selector: 'app-view-chart',
  templateUrl: './view-chart.component.html',
  styleUrls: ['./view-chart.component.scss']
})
export class ViewChartComponent implements OnInit {
   asteroidList: any[];

  constructor(private _service: AsteroidService) {
    this.asteroidList = this._service.asteroidList;
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    console.log(' this.asteroidList', this.asteroidList);
    if (this.asteroidList.length > 0) {
      localStorage.setItem('asteroids', JSON.stringify(this.asteroidList));
    }  else  {
      console.log('elseeeee');
      this.asteroidList = JSON.parse(localStorage.getItem('asteroids'));
    }
  }

  cssClass(item) {
    if (item.counter < 25) {
      return 'color-green';
    } else if (25 < item.counter && item.counter < 45) {
      return 'color-yellow';
    } else if (45 < item.counter && item.counter < 75) {
      return 'color-orange';
    } else {
      return 'color-red';
    }
  }
}
