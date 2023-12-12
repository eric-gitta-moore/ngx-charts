import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { NgxChartsModule } from '@swimlane/ngx-charts/ngx-charts.module';
import { FormsModule } from '@angular/forms';
import { SparklineComponent } from './custom-charts/sparkline/sparkline.component';
import { TimelineFilterBarChartComponent } from './custom-charts/timeline-filter-bar-chart/timeline-filter-bar-chart.component';
import { ComboChartComponent, ComboSeriesVerticalComponent } from './custom-charts/combo-chart';
import { BubbleChartInteractiveModule } from './custom-charts/bubble-chart-interactive';

@NgModule({
  imports: [NgxChartsModule, FormsModule, BubbleChartInteractiveModule],
  declarations: [
    AppComponent,
    SparklineComponent,
    TimelineFilterBarChartComponent,
    ComboChartComponent,
    ComboSeriesVerticalComponent
  ]
})
export class AppModule {}
