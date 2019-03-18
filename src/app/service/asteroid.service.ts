import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpRequest, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Asteroid } from '../model/Asteroid';


@Injectable({
  providedIn: 'root'
})
export class AsteroidService {

  private readonly url: string = `${environment.path}`;
  private readonly apiKey: string = `${environment.apiKey}`;

  public asteroidList: Asteroid[] = [];

  constructor(private httpClient: HttpClient) {}

  getData(startDate: string, endDate: string) {
    const params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate)
      .set('api_key', this.apiKey);
    return this.httpClient.get(this.url, { params: params });
  }
  getChartData(url) {
    return this.httpClient.get(url);
  }
}
