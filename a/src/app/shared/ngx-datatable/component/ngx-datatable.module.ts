import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {CommonModule} from "@angular/common";
import { NgxPaginationModule } from 'ngx-pagination';

import { NgxDatatableComponent } from './ngx-datatable.component';
import { CaptionComponent } from './caption/caption.component';

import { SearchPipe } from '../pipe/search.pipe';
import { SortPipe } from '../pipe/sort.pipe';

import { DataShowingService } from '../services/data-showing.service';
import { MaterialModule } from 'app/shared/material.module';
import { TranslocoModule } from '@ngneat/transloco';

@NgModule({
  declarations: [NgxDatatableComponent, SearchPipe, SortPipe, CaptionComponent],
  imports: [
        FormsModule,
        CommonModule,
        NgxPaginationModule,
        MaterialModule,
        TranslocoModule
    ],
    providers: [],
    exports: [NgxDatatableComponent, CaptionComponent]
})
export class NgxDatatableModule { }
