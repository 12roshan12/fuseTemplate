import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DoCheck, HostBinding, Input, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { BooleanInput } from '@angular/cdk/coercion';
import { filter, Subject, takeUntil } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { FuseVerticalNavigationComponent } from '@fuse/components/navigation/vertical/vertical.component';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { FuseNavigationItem } from '@fuse/components/navigation/navigation.types';
import { TranslocoService } from '@ngneat/transloco';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
    selector: 'fuse-vertical-navigation-collapsable-item',
    templateUrl: './collapsable.component.html',
    animations: fuseAnimations,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FuseVerticalNavigationCollapsableItemComponent implements OnInit, OnDestroy {
    /* eslint-disable @typescript-eslint/naming-convention */
    static ngAcceptInputType_autoCollapse: BooleanInput;
    /* eslint-enable @typescript-eslint/naming-convention */

    @Input() autoCollapse: boolean;
    @Input() item: FuseNavigationItem;
    @Input() name: string;

    isCollapsed: boolean = true;
    isExpanded: boolean = false;
    private _fuseVerticalNavigationComponent: FuseVerticalNavigationComponent;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    itemsMenu: any;
    menulist: any;
    language: any;
    np: boolean;
    activeLang: string;
    rolesType: any;
    provinceName: any;

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _fuseNavigationService: FuseNavigationService,
        private _translocoService: TranslocoService,
        private _authService: AuthService
    ) {
        let Role = JSON.parse(sessionStorage.getItem('user'));;
        this.rolesType = Role.userTypeId;
        
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Host binding for component classes
     */
    @HostBinding('class') get classList(): any {
        return {
            'fuse-vertical-navigation-item-collapsed': this.isCollapsed,
            'fuse-vertical-navigation-item-expanded': this.isExpanded
        };
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this._translocoService.langChanges$.subscribe((activeLang) => {

            // Get the active lang
            this.activeLang = activeLang;

            this._changeDetectorRef.markForCheck();
            // Update the navigation
            // this._updateNavigation(activeLang);
        });

        // Get the parent navigation component
        this._fuseVerticalNavigationComponent = this._fuseNavigationService.getComponent(this.name);

        // If the item has a children that has a matching url with the current url, expand...
        if (this.rolesType == 5 || this.rolesType == 6) {
            this.expand();
        } else {
            if (this._hasActiveChild(this.item, this._router.url)) {
                this.expand();
                console.log(this.isCollapsed)
                // console.log("A");

            }
            // Otherwise...
            else {
                // If the autoCollapse is on, collapse...
                if (this.autoCollapse) {

                    this.collapse();
                    // console.log("B");

                }
            }

        }

        // Listen for the onCollapsableItemCollapsed from the service
        this._fuseVerticalNavigationComponent.onCollapsableItemCollapsed
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((collapsedItem) => {

                // Check if the collapsed item is null
                if (collapsedItem === null) {
                    // console.log("C");

                    return;
                }

                // Collapse if this is a children of the collapsed item
                if (this._isChildrenOf(collapsedItem, this.item)) {
                    // console.log("D");

                    this.collapse();
                }
            });

        // Listen for the onCollapsableItemExpanded from the service if the autoCollapse is on
        if (this.autoCollapse) {
            this._fuseVerticalNavigationComponent.onCollapsableItemExpanded
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((expandedItem) => {

                    // Check if the expanded item is null
                    if (expandedItem === null) {
                        // console.log("E");

                        return;
                    }

                    // Check if this is a parent of the expanded item
                    if (this._isChildrenOf(this.item, expandedItem)) {
                        // console.log("F");

                        return;
                    }

                    // Check if this has a children with a matching url with the current active url
                    if (this._hasActiveChild(this.item, this._router.url)) {
                        // console.log("G");

                        return;
                    }

                    // Check if this is the expanded item
                    if (this.item === expandedItem) {
                        // console.log("H");

                        return;
                    }

                    // If none of the above conditions are matched, collapse this item


                    this.collapse();

                });
        }

        // Attach a listener to the NavigationEnd event
        this._router.events
            .pipe(
                filter((event): event is NavigationEnd => event instanceof NavigationEnd),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe((event: NavigationEnd) => {


                // If the item has a children that has a matching url with the current url, expand...
                if (this._hasActiveChild(this.item, event.urlAfterRedirects)) {
                    // console.log("I");

                    this.expand();
                    console.log(this.isCollapsed)
                }
                // Otherwise...
                else {
                    // If the autoCollapse is on, collapse...
                    if (this.autoCollapse) {
                        // console.log("J");                        
                        // this.collapse();
                        // uncomment this code for collapsable glitch
                    }
                }
            });

        // Subscribe to onRefreshed on the navigation component
        this._fuseVerticalNavigationComponent.onRefreshed.pipe(
            takeUntil(this._unsubscribeAll)
        ).subscribe(() => {

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });

    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Collapse
     */
    collapse(): void {
        // Return if the item is disabled
        if (this.item.disabled) {
            // console.log("K");

            return;
        }

        // Return if the item is already collapsed
        if (this.isCollapsed) {
            // console.log("L");

            return;
        }

        // Collapse it
        this.isCollapsed = true;
        this.isExpanded = !this.isCollapsed;

        // Mark for check
        this._changeDetectorRef.markForCheck();

        // Execute the observable
        this._fuseVerticalNavigationComponent.onCollapsableItemCollapsed.next(this.item);
    }

    /**
     * Expand
     */
    expand(): void {

        // Return if the item is disabled
        if (this.item.disabled) {
            // console.log("M");

            return;
        }

        // Return if the item is already expanded
        if (!this.isCollapsed) {
            // console.log("N");

            return;
        }

        // Expand it
        this.isCollapsed = false;
        this.isExpanded = !this.isCollapsed;

        // Mark for check
        this._changeDetectorRef.markForCheck();

        // Execute the observable
        this._fuseVerticalNavigationComponent.onCollapsableItemExpanded.next(this.item);
    }

    /**
     * Toggle collapsable
     */
    toggleCollapsable(): void {

        // Toggle collapse/expand
        if (this.isCollapsed) {
            // console.log("O");

            this.expand();
        }
        else {
            // console.log("P");

            this.collapse();
        }
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.moduleId || index;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Check if the given item has the given url
     * in one of its children
     *
     * @param item
     * @param currentUrl
     * @private
     */
    private _hasActiveChild(item: FuseNavigationItem, currentUrl: string): boolean {
        const children = item.children;

        if (!children) {
            // console.log("Q");

            return false;
        }

        for (const child of children) {
            if (child.children) {
                if (this._hasActiveChild(child, currentUrl)) {
                    // console.log("R");

                    return true;
                }
            }

            // Check if the child has a link and is active
            if (child.link && this._router.isActive(child.link, child.exactMatch || false)) {
                // console.log("S");

                return true;
            }
        }

        return false;
    }

    /**
     * Check if this is a children
     * of the given item
     *
     * @param parent
     * @param item
     * @private
     */
    private _isChildrenOf(parent: FuseNavigationItem, item: FuseNavigationItem): boolean {
        const children = parent.children;

        if (!children) {
            // console.log("T");

            return false;
        }

        if (children.indexOf(item) > -1) {
            // console.log("U");

            return true;
        }

        for (const child of children) {
            if (child.children) {
                if (this._isChildrenOf(child, item)) {
                    // console.log("V");

                    return true;
                }
            }
        }

        return false;
    }


}
