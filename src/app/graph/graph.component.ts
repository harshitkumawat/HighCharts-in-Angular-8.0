import { Component, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';
import { HttpClient } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';
import { GraphService } from '../graph.service';
import { map } from 'rxjs/operators';
import { CityYear } from '../city-year';
import Drilldown from 'highcharts/modules/drilldown';
import { Name_y } from '../city';


declare var require: any;
let Boost = require('highcharts/modules/boost');
let noData = require('highcharts/modules/no-data-to-display');
let More = require('highcharts/highcharts-more');

Boost(Highcharts);
noData(Highcharts);
More(Highcharts);
noData(Highcharts);
Drilldown(Highcharts);

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})
export class GraphComponent implements OnInit {

  public allcity = []
  public allYear = [];
  public cityid = {};
  public AverageTempByYear: Name_y[];
  public AverageTempByCity : Name_y[];
  loading = true;
  userModel = new CityYear('0',0);
  highcharts: any;
  highcharts2:any
  chartOptions2:any;
  chartOptions: any;
  public drilldown_name;
  public drilldown_series = []
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
         .subscribe((data:Name_y[]) => { this.AverageTempByYear = data;
            this.AvgTemperatureYear(data);
         });


   this._graphservice.getAverageTemperatureByCity()
         .subscribe((data:Name_y[]) => { this.AverageTempByCity = data;
           
            for(let i in this.AverageTempByCity){
               this.AverageTempByCity[i].name = this.cityid[this.AverageTempByCity[i].name];
            }
            console.log(this.AverageTempByCity);
            this.AvgTemperatureCity(this.AverageTempByCity);   
         });
   }

   AvgTemperatureYear(data){
         let year =  data.map(({ name }) => name);
         for(let i in data){
            data[i].y = parseFloat(data[i].y);
            data[i].drilldown = true;
         }
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
               events:{
                  drilldown: (function(component){
                     return function (e: any) { 
                       component.drilldown_name = e.point.name;
                       component.drilldown_series = [];
                       var usermodel = new CityYear("0",component.drilldown_name);
                       console.log(usermodel);   
                       component._graphservice.enrollforcityYear(usermodel)
                       .subscribe(
                            data => {
                               for(let i in data){
                                  data[i].y = parseFloat(data[i].y);
                                  component.drilldown_series.push([component.cityid[data[i].name],data[i].y])
                               }
                               if (!e.seriesOptions) {
                                 console.log(component.drilldown_series);
                                  var chart = this, 
                                  drilldowns = { 
                                    drilldown_City: {
                                    name: component.drilldown_name,	
                                    id:component.drilldown_name,	
                                    colorByPoint: true,
                                    data: component.drilldown_series
                                    },    
                                    },
                                 series = drilldowns['drilldown_City'];
                                 // Show the loading label chart.showLoading('drilldown event called, Loading ...');
                                 setTimeout(function () { 
                                    chart.hideLoading(); 
                                    chart.addSeriesAsDrilldown(e.point, series);
                                 }, 500);
                                 }
                             },
                            error => console.error('error',error)
                          );
                        }
                 })(this),
                 
               },
            },
            title: {
               text: 'Average Temperature '+name
            },
            xAxis:{
               type: 'category',
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
               colorByPoint: true,
               data: data
            }],
            drilldown:{ series:[],}
         };
         this.loading = false;
      }

   AvgTemperatureCity(data){
      let cityname = [];
      for(let i in data){
         cityname.push(data[i].name);
         data[i].y = parseFloat(data[i].y)
         data[i].drilldown = data[i].name
      }
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
            type: 'column',
            events:{
               drilldown: (function(component){
                  return function (e: any) { 
                    component.drilldown_name = e.point.name;
                    component.drilldown_series = [];
                    for(let i in component.cityid){
                       if(component.cityid[i]==e.point.name){
                          var index = i;
                       }
                    }
                    var usermodel = new CityYear(index,-1);   
                    component._graphservice.enroll(usermodel)
                    .subscribe(
                         data => {
                            for(let i in data){
                               data[i].y = parseFloat(data[i].y);
                               component.drilldown_series.push([data[i].name,data[i].y])
                            }
                            if (!e.seriesOptions) {                              
                               var chart = this, 
                               drilldowns = { 
                                 drilldown_City: {
                                 name: component.drilldown_name,	
                                 id: component.drilldown_name,	
                                 colorByPoint: true,
                                 data: component.drilldown_series
                                 },    
                                 },
                              series = drilldowns['drilldown_City'];
                              // Show the loading label chart.showLoading('drilldown event called, Loading ...');
                              setTimeout(function () { 
                                 chart.hideLoading(); 
                                 chart.addSeriesAsDrilldown(e.point, series);
                              }, 500);
                              }
                          },
                         error => console.error('error',error)
                       );
                     }
              })(this),
              
            },
         },
         title: {
            text: 'Average Temperature '+name
         },
         xAxis:{
            type: 'category',
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
            colorByPoint: true,
            data: data
         }],
        drilldown: { series:[] }
      };
      this.loading = false;
      //console.log(this.AverageTempByCity,this.AverageTempByYear);

   }

  constructor(private _graphservice: GraphService) {
     const that = this;
  }
  onSubmit(){
    //console.log(this.AverageTempByCity);
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
              for(let i in data){
                 data[i].name = this.cityid[data[i].name]
              }
              this.AvgTemperatureCity(data);
            },
           error => console.error('error',error)
         );        
     } 
     else{
      this._graphservice.enrollforcityYear(this.userModel)
      .subscribe(
           data => {
            for(let i in data){
               data[i].name = this.cityid[data[i].name]
            }
              this.AvgTemperatureCity(data);
            },
           error => console.error('error',error)
         );
     }
   
}
}