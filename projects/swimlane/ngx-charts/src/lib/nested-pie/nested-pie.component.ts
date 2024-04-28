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
import { LegendOptions, LegendPosition } from '@swimlane/ngx-charts/common/types/legend.model';
import { DataItem, NestedPieMultiSeries } from '@swimlane/ngx-charts/models/chart-data.model';
import { ColorHelper } from '@swimlane/ngx-charts/common/color.helper';
import { ViewDimensions } from '@swimlane/ngx-charts/common/types/view-dimension.interface';
import { calculateViewDimensions } from '@swimlane/ngx-charts/common/view-dimensions.helper';
import { ScaleType } from '@swimlane/ngx-charts/common/types/scale-type.enum';
import { BaseChartComponent } from '@swimlane/ngx-charts/common/base-chart.component';

@Component({
  selector: 'ngx-charts-nested-pie',
  template: `
    <ngx-charts-chart
      [view]="[width, height]"
      [showLegend]="legend"
      [legendOptions]="legendOptions"
      [activeEntries]="activeEntries"
      [animations]="animations"
      (legendLabelActivate)="onActivate($event, true)"
      (legendLabelDeactivate)="onDeactivate($event, true)"
      (legendLabelClick)="onClick($event)"
    >
      <svg:g
        *ngFor="let pie of data; let idx = index; trackBy: trackBy"
        [attr.transform]="translation"
        class="pie-chart chart"
      >
        <svg:g
          ngx-charts-pie-series
          [colors]="colors"
          [series]="pie.series"
          [showLabels]="idx === 0 ? labels : null"
          [labelFormatting]="labelFormatting"
          [trimLabels]="trimLabels"
          [maxLabelLength]="maxLabelLength"
          [activeEntries]="activeEntries"
          [innerRadius]="pie.radius[0]"
          [outerRadius]="pie.radius[1]"
          [explodeSlices]="explodeSlices"
          [gradient]="gradient"
          [animations]="animations"
          [tooltipDisabled]="tooltipDisabled"
          [tooltipTemplate]="tooltipTemplate"
          [tooltipText]="tooltipText"
          (dblclick)="dblclick.emit($event)"
          (select)="onClick($event)"
          (activate)="onActivate($event)"
          (deactivate)="onDeactivate($event)"
        />
      </svg:g>
    </ngx-charts-chart>
  `,
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

  translation: string;
  data: NestedPieMultiSeries;
  colors: ColorHelper;
  domain: string[];
  dims: ViewDimensions;
  legendOptions: LegendOptions;

  update(): void {
    super.update();

    if (this.labels && this.hasNoOptionalMarginsSet()) {
      this.margins = [30, 80, 30, 80];
    } else if (!this.labels && this.hasNoOptionalMarginsSet()) {
      // default value for margins
      this.margins = [20, 20, 20, 20];
    }

    this.dims = calculateViewDimensions({
      width: this.width,
      height: this.height,
      margins: this.margins,
      showLegend: this.legend,
      legendPosition: this.legendPosition
    });

    this.formatDates();

    const xOffset = this.margins[3] + this.dims.width / 2;
    const yOffset = this.margins[0] + this.dims.height / 2;
    this.translation = `translate(${xOffset}, ${yOffset})`;

    this.domain = this.getDomain();

    // sort data according to outerRadius
    this.data = this.results.sort((a, b) => {
      return b.radius[1] - a.radius[1];
    });

    let globalOuterRadius = Math.min(this.dims.width, this.dims.height);
    if (this.labels) {
      // make room for labels
      globalOuterRadius /= 3;
    } else {
      globalOuterRadius /= 2;
    }
    const globalInnerRadius = 0;

    /**
     * If ratio is not greater than 1, then it is converted proportionally
     * Otherwise, ratio is directly used as radius
     */
    this.data = this.results.map(item => {
      if (globalOuterRadius < 1) {
        // The chart width is too small
        return item;
      }
      const [innerRadiusRatio, outerRadiusRatio] = item.radius;
      item.radius = [
        innerRadiusRatio <= 1 ? globalOuterRadius * innerRadiusRatio : innerRadiusRatio,
        outerRadiusRatio <= 1 ? globalOuterRadius * outerRadiusRatio : outerRadiusRatio
      ];

      return item;
    });

    this.setColors();
    this.legendOptions = this.getLegendOptions();
  }

  getDomain(): string[] {
    return this.results.map(d => d.label);
  }

  onClick(data: DataItem | string): void {
    this.select.emit(data);
  }

  setColors(): void {
    this.colors = new ColorHelper(this.scheme, ScaleType.Ordinal, this.domain, this.customColors);
  }

  getLegendOptions(): LegendOptions {
    return {
      scaleType: ScaleType.Ordinal,
      domain: this.domain,
      colors: this.colors,
      title: this.legendTitle,
      position: this.legendPosition
    };
  }

  onActivate(item, fromLegend = false): void {
    item = this.results.find(d => {
      if (fromLegend) {
        return d.label === item.name;
      } else {
        return d.name === item.name;
      }
    });

    const idx = this.activeEntries.findIndex(d => {
      return d.name === item.name && d.value === item.value && d.series === item.series;
    });
    if (idx > -1) {
      return;
    }

    this.activeEntries = [item, ...this.activeEntries];
    this.activate.emit({ value: item, entries: this.activeEntries });
  }

  onDeactivate(item, fromLegend = false): void {
    item = this.results.find(d => {
      if (fromLegend) {
        return d.label === item.name;
      } else {
        return d.name === item.name;
      }
    });

    const idx = this.activeEntries.findIndex(d => {
      return d.name === item.name && d.value === item.value && d.series === item.series;
    });

    this.activeEntries.splice(idx, 1);
    this.activeEntries = [...this.activeEntries];

    this.deactivate.emit({ value: item, entries: this.activeEntries });
  }

  private hasNoOptionalMarginsSet(): boolean {
    return !this.margins || this.margins.length <= 0;
  }

  trackBy(index, pie): string {
    return pie.name;
  }
}
