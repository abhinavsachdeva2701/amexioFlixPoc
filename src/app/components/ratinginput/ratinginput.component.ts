/*
 * Copyright 2016-2017 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Author -  Pratik Kelwalkar
 *
 */
import {Component, OnInit, Input, Output, EventEmitter, HostListener, forwardRef, NgModule} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, Validator, AbstractControl} from "@angular/forms";
import {CommonModule} from '@angular/common';

@Component({
  selector: 'amexio-rating-input',
  template: `
    <span (mouseleave)="resetHovered()"
          class="amexio-rating"
          [class.disabled]="disabled"
          [class.readonly]="readonly"
          tabindex="0"
          role="slider"
          aria-valuemin="0"
          [attr.aria-valuemax]="ratingRange.length"
          [attr.aria-valuenow]="model">
    <span *ngFor="let item of ratingRange; let index = index">
        <i (mouseenter)="setHovered(item)"
           (mousemove)="changeHovered($event)"
           (click)="rate(item)"
           [attr.data-icon]="fullIcon"
           class="{{ iconClass }} half{{ calculateWidth(item) }}"
           [title]="titles[index] || item">{{ emptyIcon }}</i>
    </span>
</span>
  `,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => RatingInputComponent), multi: true },
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => RatingInputComponent), multi: true },
  ],
  styles : [
    `/**
 A Style Sheet for all form inputs common used classes
 */

      /** Form Validations & Icon Positioning **/
      .has-feedback-custom {
          position: relative;
      }
      .has-feedback-custom .form-control {
          padding-right: 47.5px;
      }

      .form-control-feedback-custom {
          position: absolute;
          top: 0;
          right: 0;
          z-index: 2;
          display: block;
          width: 38px;
          height: 38px;
          line-height: 38px;
          text-align: center;
          pointer-events: none;
      }

      .has-feedback-custom label ~ .form-control-feedback-custom {
          top: 32px;
      }
      .has-feedback-custom label.sr-only ~ .form-control-feedback-custom {
          top: 0;
      }
      .amexio-rating {
          cursor: pointer;
          outline: none;
      }
      .amexio-rating.readonly {
          cursor: default;
      }
      .amexio-rating.disabled {
          cursor: not-allowed;
      }
      .amexio-rating i{
          font-style: normal;
      }
      .amexio-star-icon {
          color: #666666;
          font-size: 2em;
          position: relative;
          border-color: 1px solid black;
      }
      .amexio-star-icon:before {
          color: #FDE16D;
          content: attr(data-icon) " ";
          position: absolute;
          left: 0;
          overflow: hidden;
          width: 0;
      }
      .amexio-rating.disabled .amexio-star-icon:before {
          color: #ECECEC;
          text-shadow: none;
      }
      .amexio-star-icon.half10:before {
          width: 10%;
      }
      .amexio-star-icon.half20:before {
          width: 20%;
      }
      .amexio-star-icon.half30:before {
          width: 30%;
      }
      .amexio-star-icon.half40:before {
          width: 40%;
      }
      .amexio-star-icon.half50:before {
          width: 50%;
      }
      .amexio-star-icon.half60:before {
          width: 60%;
      }
      .amexio-star-icon.half70:before {
          width: 70%;
      }
      .amexio-star-icon.half80:before {
          width: 80%;
      }
      .amexio-star-icon.half90:before {
          width: 90%;
      }
      .amexio-star-icon.half100:before {
          width: 100%;
      }
      @-moz-document url-prefix() { /* Firefox Hack */
          .amexio-star-icon {
              font-size: 50px;
              line-height: 34px;
          }
      }
    `
  ]
})
export class RatingInputComponent implements OnInit, ControlValueAccessor, Validator {

  // -------------------------------------------------------------------------
  // Inputs
  // -------------------------------------------------------------------------

  @Input()
  iconClass = "amexio-star-icon";

  @Input()
  fullIcon = "★";

  @Input()
  emptyIcon = "☆";

  @Input()
  readonly: boolean;

  @Input()
  disabled: boolean;

  @Input()
  required: boolean;

  @Input()
  float: boolean;

  @Input()
  titles: string[] = [];

  // -------------------------------------------------------------------------
  // Input Accessors
  // -------------------------------------------------------------------------

  @Input()
  set max(max: number) {
    this._max = max;
    this.buildRanges();
  }

  get max() {
    return this._max;
  }

  // -------------------------------------------------------------------------
  // Outputs
  // -------------------------------------------------------------------------

  @Output()
  onHover = new EventEmitter();

  @Output()
  onLeave = new EventEmitter();

  // -------------------------------------------------------------------------
  // Public properties
  // -------------------------------------------------------------------------

  model: number;
  ratingRange: number[];
  hovered: number = 0;
  hoveredPercent: number = undefined;

  // -------------------------------------------------------------------------
  // Private Properties
  // -------------------------------------------------------------------------

  private _max: number = 5;
  private onChange: (m: any) => void;
  private onTouched: (m: any) => void;

  // -------------------------------------------------------------------------
  // Implemented from ControlValueAccessor
  // -------------------------------------------------------------------------

  writeValue(value: number): void {
    /*if (value % 1 !== value) {
     this.model = Math.round(value);
     return;
     }*/

    this.model = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  // -------------------------------------------------------------------------
  // Implemented from Va..
  // -------------------------------------------------------------------------

  validate(c: AbstractControl) {
    if (this.required && !c.value) {
      return {
        required: true
      };
    }
    return null;
  }

  // -------------------------------------------------------------------------
  // Lifecycle callbacks
  // -------------------------------------------------------------------------

  ngOnInit() {
    this.buildRanges();
  }

  // -------------------------------------------------------------------------
  // Host Bindings
  // -------------------------------------------------------------------------

  @HostListener("keydown", ["$event"])
  onKeydown(event: KeyboardEvent): void {
    if ([37, 38, 39, 40].indexOf(event.which) === -1 || this.hovered)
      return;

    event.preventDefault();
    event.stopPropagation();
    const increment = this.float ? 0.5 : 1;
    this.rate(this.model + (event.which === 38 || event.which === 39 ? increment : increment * -1));
  }

  // -------------------------------------------------------------------------
  // Public Methods
  // -------------------------------------------------------------------------

  calculateWidth(item: number) {
    if (this.hovered > 0) {
      if (this.hoveredPercent !== undefined && this.hovered === item)
        return this.hoveredPercent;

      return this.hovered >= item ? 100 : 0;
    }
    return this.model >= item ? 100 : 100 - Math.round((item - this.model) * 10) * 10;
  }

  setHovered(hovered: number): void {
    if (!this.readonly && !this.disabled) {
      this.hovered = hovered;
      this.onHover.emit(hovered);
    }
  }

  changeHovered(event: MouseEvent): void {
    if (!this.float) return;
    const target = event.target as HTMLElement;
    const relativeX = event.pageX - target.offsetLeft;
    const percent = Math.round((relativeX * 100 / target.offsetWidth) / 10) * 10;
    this.hoveredPercent = percent > 50 ? 100 : 50;
  }

  resetHovered() {
    this.hovered = 0;
    this.hoveredPercent = undefined;
    this.onLeave.emit(this.hovered);
  }


  rate(value: number) {
    if (!this.readonly && !this.disabled && value >= 0 && value <= this.ratingRange.length) {
      const newValue = this.hoveredPercent ? (value - 1) + this.hoveredPercent / 100 : value;
      this.onChange(newValue);
      this.model = newValue;
    }
  }

  // -------------------------------------------------------------------------
  // Private Methods
  // -------------------------------------------------------------------------

  private buildRanges() {
    this.ratingRange = this.range(1, this.max);
  }

  private range(start: number, end: number) {
    const foo: number[] = [];
    for (let i = start; i <= end; i++) {
      foo.push(i);
    }
    return foo;
  }

}
