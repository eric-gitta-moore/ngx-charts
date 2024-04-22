import { BaseChartComponent } from '@swimlane/ngx-charts/common/base-chart.component';
import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  ViewEncapsulation
} from '@angular/core';
import { LegendPosition } from '@swimlane/ngx-charts/common/types/legend.model';

@Component({
  selector: 'ngx-charts-nested-pie',
  templateUrl: ``,
  styleUrls: ['../common/base-chart.component.scss', './nested-pie.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NestedPieComponent extends BaseChartComponent {
  @Input() labels: boolean = false;
  @Input() legend: boolean = false;
  @Input() legendTitle: string = 'Legend';
  @Input() legendPosition: LegendPosition = LegendPosition.Right;
  @Input() explodeSlices: boolean = false;
  @Input() doughnut: boolean = false;
  @Input() arcWidth: number = 0.25;
  @Input() gradient: boolean;
  @Input() activeEntries: any[] = [];
  @Input() tooltipDisabled: boolean = false;
  @Input() labelFormatting: any;
  @Input() trimLabels: boolean = true;
  @Input() maxLabelLength: number = 10;
  @Input() tooltipText: any;
  @Output() dblclick = new EventEmitter();
  // optional margins
  @Input() margins: number[];
  @Output() select = new EventEmitter();
  @Output() activate = new EventEmitter();
  @Output() deactivate = new EventEmitter();

  @ContentChild('tooltipTemplate') tooltipTemplate: TemplateRef<any>;
}
