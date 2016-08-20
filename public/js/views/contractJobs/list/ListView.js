define([
    'jQuery',
    'Underscore',
    'views/listViewBase',
    'text!templates/contractJobs/list/ListHeader.html',
    'views/contractJobs/list/ListItemView',
    'collections/contractJobs/filterCollection',
    'models/InvoiceModel',
    'views/salesInvoices/EditView',
    'custom'
], function ($, _, ListViewBase, listTemplate, ListItemView, contentCollection, InvoiceModel, EditView, custom) {
    'use strict';
    var EmployeesListView = ListViewBase.extend({
        listTemplate     : listTemplate,
        ListItemView     : ListItemView,
        contentCollection: contentCollection,
        hasPagination    : true,
        contentType      : 'contractJobs',

        events: {
            'click .invoice': 'showInvoice'
        },

        initialize: function (options) {
            var dateRange;

            this.startTime = options.startTime;
            this.collection = options.collection;

            this.filter = options.filter;
            this.defaultItemsNumber = this.collection.namberToShow || 100;
            this.deleteCounter = 0;
            this.page = options.collection.currentPage;
            this.contentCollection = contentCollection;

            dateRange = custom.retriveFromCash('contractJobsDateRange');

            this.filter = options.filter || custom.retriveFromCash('contractJobs.filter');

            if (!this.filter) {
                this.filter = {};
            }

            if (!this.filter.date) {
                this.filter.date = {
                    key  : 'date',
                    type: 'date',
                    value: [dateRange.startDate, dateRange.endDate]
                };

            }

            this.startDate = new Date(this.filter.date.value[0]);
            this.endDate = new Date(this.filter.date.value[1]);

            custom.cacheToApp('contractJobs.filter', this.filter);

            ListViewBase.prototype.initialize.call(this, options);
        },

        showInvoice: function (e) {
            var $target = $(e.target);
            var id = $target.attr('data-id');
            var model = new InvoiceModel({validate: false});

            model.urlRoot = '/Invoices';
            model.fetch({
                data: {
                    id      : id,
                    forSales: true,
                    viewType: 'form'
                },

                success: function (model) {
                    return new EditView({model: model});
                },

                error: function () {
                    App.render({
                        type   : 'error',
                        message: 'Please refresh browser'
                    });
                }
            });
        },

        changeDateRange: function () {
            var stDate = $('#startDate').val();
            var enDate = $('#endDate').val();
            var searchObject;

            this.startDate = new Date(stDate);
            this.endDate = new Date(enDate);

            if (!this.filter) {
                this.filter = {};
            }

            this.filter.date = {
                key  : 'date',
                type: 'date',
                value: [stDate, enDate]
            };

            searchObject = {
                startDate: stDate,
                endDate  : enDate,
                filter   : this.filter
            };

            this.collection.getPage(1, searchObject);

            App.filtersObject.filter = this.filter;

            custom.cacheToApp('contractJobs.filter', this.filter);
        },

        showFilteredPage: function (filter) {
            var itemsNumber = $('#itemsNumber').text();

            this.startTime = new Date();
            this.newCollection = false;

            this.filter = Object.keys(filter).length === 0 ? {} : filter;

            this.changeLocationHash(1, itemsNumber, filter);
            this.collection.getPage(1, {
                count    : itemsNumber,
                page     : 1,
                filter   : filter,
                startDate: this.startDate,
                endDate  : this.endDate
            });
        },

        showMoreContent: function (newModels) {
            this.$el.find('#listTable').html('');
            this.$el.append(new this.ListItemView({
                collection : newModels,
                page       : this.page,
                itemsNumber: this.collection.namberToShow
            }).render());
        },

        render: function () {
            var $currentEl;

            $('.ui-dialog ').remove();
            $currentEl = this.$el;

            $currentEl.html('');
            $currentEl.append(_.template(this.listTemplate));
            $currentEl.append(new this.ListItemView({
                collection : this.collection,
                page       : this.page,
                itemsNumber: this.collection.namberToShow
            }).render());
        }

    });

    return EmployeesListView;
});
