import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CityName } from './city';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { CityYear } from './city-year';

@Injectable({
  providedIn: 'root'
})
export class GraphService {

  private _url_city = 'http://127.0.0.1:8000/city/'
  private _url_temp = 'http://127.0.0.1:8000/year/'
  private _url_avg_temp = 'http://127.0.0.1:8000/AverageTemperatureByYear/'
  private _url_avg_tempbyCity = 'http://127.0.0.1:8000/AverageTemperatureByCity/'
  constructor(private http: HttpClient) { }

  getCity():Observable<any>{
    return this.http.get(this._url_city)
                    .pipe(catchError(this.errorHandler));
  }

  getTemperature(){
    return this.http.get(this._url_temp)
                    .pipe(catchError(this.errorHandler));
  }
  getAverageTemperature(){
    return this.http.get(this._url_avg_temp)
                    .pipe(catchError(this.errorHandler));
  }
  getAverageTemperatureByCity(){
    return this.http.get(this._url_avg_tempbyCity)
                    .pipe(catchError(this.errorHandler));
  }
  errorHandler(error:HttpErrorResponse){
    return throwError(error.message || "Server Error");
  }

  enroll(cityyear: CityYear){
    return this.http.post<any>(this._url_avg_temp,cityyear);
  }
  enrollforcity(cityyear: CityYear){
    return this.http.post<any>(this._url_avg_tempbyCity,cityyear);
  }
  enrollforcityYear(cityyear: CityYear){
    return this.http.post<any>(this._url_avg_tempbyCity,cityyear);
  }
}
