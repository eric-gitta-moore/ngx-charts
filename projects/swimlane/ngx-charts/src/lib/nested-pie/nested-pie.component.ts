import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  TrackByFunction,
  ViewEncapsulation
} from '@angular/core';
import { LegendOptions, LegendPosition } from '@swimlane/ngx-charts/common/types/legend.model';
import { DataItem, NestedPieMultiSeries, NestedPieSeries } from '@swimlane/ngx-charts/models/chart-data.model';
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
      (legendLabelActivate)="onActivate($event, undefined, true)"
      (legendLabelDeactivate)="onDeactivate($event, undefined, true)"
      (legendLabelClick)="onClick($event)"
    >
      <svg:g
        *ngFor="let pie of data; trackBy: trackBy"
        [attr.transform]="translation"
        class="pie-chart chart"
      >
        <svg:g
          ngx-charts-pie-series
          [colors]="colors"
          [series]="pie.series"
          [showLabels]="pie.isShowLabel"
          [labelFormatting]="labelFormatting"
          [trimLabels]="trimLabels"
          [maxLabelLength]="maxLabelLength"
          [activeEntries]="activeEntries"
          [innerRadius]="pie.innerRadius"
          [outerRadius]="pie.outerRadius"
          [explodeSlices]="explodeSlices"
          [gradient]="gradient"
          [animations]="animations"
          [tooltipDisabled]="tooltipDisabled"
          [tooltipTemplate]="tooltipTemplate"
          [tooltipText]="tooltipText"
          (dblclick)="dblclick.emit($event)"
          (select)="onClick($event)"
          (activate)="onActivate($event, pie)"
          (deactivate)="onDeactivate($event, pie)"
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
  @Input() visibilityLegends: string[] | undefined;
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
      return b.outerRadius - a.outerRadius;
    });
    this.data.map((e, i) => {
      e.isShowLabel = i === 0;
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
      const { innerRadiusRatio, outerRadiusRatio } = item;
      item.innerRadius = innerRadiusRatio <= 1 ? globalOuterRadius * innerRadiusRatio : innerRadiusRatio;
      item.outerRadius = outerRadiusRatio <= 1 ? globalOuterRadius * outerRadiusRatio : outerRadiusRatio;

      return item;
    });

    this.setColors();
    this.legendOptions = this.getLegendOptions();
  }

  getDomain(): string[] {
    const domain = [];
    for (const group of this.results) {
      for (const d of group.series) {
        if (!domain.includes(d.label)) {
          domain.push(d.label);
        }
      }
    }

    return domain;
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
      domain: this.visibilityLegends ? this.domain.filter(e => this.visibilityLegends.includes(e)) : this.domain,
      colors: this.colors,
      title: this.legendTitle,
      position: this.legendPosition
    };
  }

  onActivate(event, pie: NestedPieSeries, fromLegend: boolean = false): void {
    const item = Object.assign({}, event);
    if (pie) {
      item.series = pie.name;
    }

    const items = this.results
      .map(g => g.series)
      .flat()
      .filter(i => {
        if (fromLegend) {
          return i.label === item.name;
        } else {
          return i.name === item.name && i.series === item.series;
        }
      });

    this.activeEntries = [...items];
    this.activate.emit({ value: item, entries: this.activeEntries });
  }

  onDeactivate(event, pie: NestedPieSeries, fromLegend: boolean = false): void {
    const item = Object.assign({}, event);
    if (pie) {
      item.series = pie.name;
    }

    this.activeEntries = this.activeEntries.filter(i => {
      if (fromLegend) {
        return i.label !== item.name;
      } else {
        return !(i.name === item.name && i.series === item.series);
      }
    });

    this.deactivate.emit({ value: item, entries: this.activeEntries });
  }

  private hasNoOptionalMarginsSet(): boolean {
    return !this.margins || this.margins.length <= 0;
  }

  trackBy: TrackByFunction<NestedPieSeries> = (index, pie) => {
    return pie.name;
  };
}
