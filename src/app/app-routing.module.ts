import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './component/main/main.component';
import { ViewChartComponent } from './component/view-chart/view-chart.component';

const routes: Routes = [
  { path: '', redirectTo: 'main', pathMatch: 'full' },
  { path: 'main', component: MainComponent },
  { path: 'charts', component: ViewChartComponent },
  { path: '**', redirectTo: '/', pathMatch: 'full' }
];

@NgModule({
  // imports: [RouterModule.forRoot(routes, { enableTracing: false } )],
  imports: [RouterModule.forRoot(routes)], // , { useHash: true }
  exports: [RouterModule]
})
export class AppRoutingModule {}
