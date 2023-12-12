import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { SparklineComponent } from './custom-charts/sparkline/sparkline.component';
import { TimelineFilterBarChartComponent } from './custom-charts/timeline-filter-bar-chart/timeline-filter-bar-chart.component';
import { NgxChartsModule } from '@swimlane/ngx-charts/ngx-charts.module';
import { ComboChartComponent, ComboSeriesVerticalComponent } from './custom-charts/combo-chart';
import { BubbleChartInteractiveModule } from './custom-charts/bubble-chart-interactive';
import { NgxUIModule } from '@swimlane/ngx-ui';

@NgModule({
  imports: [NgxChartsModule, FormsModule, NgxUIModule, BubbleChartInteractiveModule],
  declarations: [
    AppComponent,
    SparklineComponent,
    TimelineFilterBarChartComponent,
    ComboChartComponent,
    ComboSeriesVerticalComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}