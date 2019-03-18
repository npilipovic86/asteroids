import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainComponent } from './component/main/main.component';
import { ViewChartComponent } from './component/view-chart/view-chart.component';
import { HttpClientModule } from '@angular/common/http';
import { AsteroidService } from './service/asteroid.service';

@NgModule({
  declarations: [AppComponent, MainComponent, ViewChartComponent],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule, FormsModule, ReactiveFormsModule],
  providers: [AsteroidService],
  bootstrap: [AppComponent]
})
export class AppModule {}
