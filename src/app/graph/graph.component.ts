import { Component, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';
import { HttpClient } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';
import { GraphService } from '../graph.service';
import { CityName } from '../city';
import { map } from 'rxjs/operators';
import { CityYear } from '../city-year';

declare var require: any;
let Boost = require('highcharts/modules/boost');
let noData = require('highcharts/modules/no-data-to-display');
let More = require('highcharts/highcharts-more');

Boost(Highcharts);
noData(Highcharts);
More(Highcharts);
noData(Highcharts);

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})
export class GraphComponent implements OnInit {

  public allcity: CityName;
  public allYear = [];
  public cityid = {};
  public AverageTempByYear = [];
  public AverageTempByCity = [];
  loading = true;
  userModel = new CityYear('0',0);
  highcharts: any;
  highcharts2:any
  chartOptions2:any;
  chartOptions: any;
  ngOnInit(){
   this._graphservice.getCity()
         .subscribe((data:any) =>{ this.allcity = data;
            for(let i in this.allcity){
            this.cityid[this.allcity[i].id] = this.allcity[i].City_Name;
            }
         });

   this._graphservice.getTemperature()
         .subscribe((data:any) => { this.allYear = data;
          });


   this._graphservice.getAverageTemperature()
         .subscribe((data:any[]) => { this.AverageTempByYear = data;
            this.AvgTemperatureYear(data);
         });


   this._graphservice.getAverageTemperatureByCity()
         .subscribe((data:any[]) => { this.AverageTempByCity = data;
            let city = this.AverageTempByCity.map(({ ID }) => parseInt(ID));
            this.AvgTemperatureCity(data);
         });
   }

   AvgTemperatureYear(data){
         let year =  data.map(({ Year }) => Year);
         let name  = '';
         if(year.length==1){
            name = "in "+year;
         }
         else{
            name = "in Year";
         }
         this.highcharts = Highcharts;
         this.chartOptions = {
            chart: {
               type: 'column',
               events: {
                  drilldown : function(e){
                          console.log('clicked',e); 
                  },
              },
            },
            title: {
               text: 'Average Temperature '+name
            },
            xAxis:{
               categories: year,
               crosshair: true        
            },     
            yAxis : {
               min: 0,
               title: {
                  text: 'Temperature in Celsius'         
               }      
            },
            tooltip : {
               headerFormat: '<span style = "font-size:10px">{point.key}</span><table>',
               pointFormat: '<tr><td style = "color:{series.color};padding:0">Average Temperature: </td>' +
                  '<td style = "padding:0"><b>{point.y:.1f} C</b></td></tr>', footerFormat: '</table>', shared: true, useHTML: true
            },
            plotOptions : {
               column: {
                  pointPadding: 0.2,
                  borderWidth: 0
               }
            },
            series: [{
               name: 'Year',
               data: data.map(({ temperature__avg }) => parseFloat(temperature__avg))
            }],
         };
         this.loading = false;
      
   }
   DrilldownCallbackFunction(e){
         console.log(e,"Harry");
   }

   AvgTemperatureCity(data){
      let cityname = []
      for(let i in data){
         cityname.push(this.cityid[data[i].ID]);
      }
      console.log(this.userModel.Year);
      let name = ''
      if(cityname.length!=1){
         name = "By City";
      }
      else if(cityname.length==1 && this.userModel.Year==0){
         name = "in "+cityname;
      }
      else{
         name = "in "+cityname+" "+this.userModel.Year;
      }
      this.highcharts2 = Highcharts;
      this.chartOptions2 = {
         chart: {
            type: 'column'
         },
         title: {
            text: 'Average Temperature '+name
         },
         xAxis:{
            categories: cityname,
            crosshair: true        
         },     
         yAxis : {
            min: 0,
            title: {
               text: 'Temperature in  Celsius'         
            }      
         },
         tooltip : {
            headerFormat: '<span style = "font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style = "color:{series.color};padding:0">Average Temperature: </td>' +
               '<td style = "padding:0"><b>{point.y:.1f} C</b></td></tr>', footerFormat: '</table>', shared: true, useHTML: true
         },
         plotOptions : {
            column: {
               pointPadding: 0.2,
               borderWidth: 0
            }
         },
         series: [{
            name: 'City',
            data: data.map(({ temperature__avg }) => parseFloat(temperature__avg))
         }]
      };
      this.loading = false;

   }
  constructor(private _graphservice: GraphService) {}
  onSubmit(){
     if(this.userModel.City_Name=="0" && this.userModel.Year==0){
      this.AvgTemperatureYear(this.AverageTempByYear);
      this.AvgTemperatureCity(this.AverageTempByCity);
     }
     else if(this.userModel.City_Name=="0"){
      this._graphservice.enroll(this.userModel)
      .subscribe(
           data => {
              this.AvgTemperatureYear(data);
            },
           error => console.error('error',error)
         );
     }
     else if(this.userModel.Year==0){
      this._graphservice.enrollforcity(this.userModel)
      .subscribe(
           data => {
              this.AvgTemperatureCity(data);
            },
           error => console.error('error',error)
         );        
     } 
     else{
      this._graphservice.enrollforcityYear(this.userModel)
      .subscribe(
           data => {
              this.AvgTemperatureCity(data);
            },
           error => console.error('error',error)
         );
     }
   
}
}