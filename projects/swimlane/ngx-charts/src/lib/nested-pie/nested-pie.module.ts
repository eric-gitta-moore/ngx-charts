import { NgModule } from '@angular/core';
import { NestedPieComponent } from '@swimlane/ngx-charts/nested-pie/nested-pie.component';
import { ChartCommonModule } from '@swimlane/ngx-charts/common/chart-common.module';
import { PieChartModule } from '@swimlane/ngx-charts/pie-chart/pie-chart.module';

@NgModule({
  imports: [ChartCommonModule, PieChartModule],
  exports: [NestedPieComponent],
  declarations: [NestedPieComponent]
})
export class NestedPieModule {}
