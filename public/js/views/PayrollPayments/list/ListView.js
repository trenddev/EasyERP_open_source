define([
    'jQuery',
    'Underscore',
    'views/listViewBase',
    'text!templates/Pagination/PaginationTemplate.html',
    'text!templates/PayrollPayments/list/ListHeader.html',
    'views/Filter/FilterView',
    'views/PayrollPayments/DialogView',
    'models/PaymentModel',
    'views/PayrollPayments/list/ListItemView',
    'views/PayrollPayments/list/ListTotalView',
    'collections/PayrollPayments/filterCollection',
    'collections/PayrollPayments/editCollection',
    'dataService',
    'populate',
    'async',
    'constants'
], function ($, _, listViewBase, paginationTemplate, listTemplate, filterView, DialogView, currentModel, ListItemView, ListTotalView, paymentCollection, editCollection, dataService, populate, async, CONSTANTS) {
    'use strict';

    var PaymentListView = listViewBase.extend({
        el           : '#content-holder',
        contentType  : 'PayrollPayments',
        viewType     : 'list',
        listTemplate : listTemplate,
        listItemView : ListItemView,
        filterView   : filterView,
        changedModels: {},
        responseObj  : {},

        events: {
            'click td:not(.notForm )': 'showDialog'
        },

        initialize: function (options) {
            $(document).off('click');

            this.startTime = options.startTime;
            this.collection = options.collection;
            this.parrentContentId = options.collection.parrentContentId;
            this.sort = options.sort;
            this.filter = options.filter;
            this.page = options.collection.currentPage;
            this.contentCollection = paymentCollection;

            this.render();
        },

        render: function (options) {
            var self = this;
            var $currentEl = this.$el;
            var pagenation;

            $('.ui-dialog ').remove();

            $currentEl.html('');
            $currentEl.append(_.template(listTemplate));
            $currentEl.append(new ListItemView({
                collection : this.collection,
                page       : this.page,
                itemsNumber: this.collection.namberToShow
            }).render());

            $currentEl.append(new ListTotalView({element: this.$el.find('#listTable'), cellSpan: 6}).render());

            $('#check_all').click(function () {
                $(':checkbox').prop('checked', this.checked);

                if ($('input.checkbox:checked').length > 0) {
                    $('#top-bar-deleteBtn').show();
                } else {
                    $('#top-bar-deleteBtn').hide();
                }
            });

            $currentEl.append(_.template(paginationTemplate));

            pagenation = this.$el.find('.pagination');

            if (this.collection.length === 0) {
                pagenation.hide();
            } else {
                pagenation.show();
            }

            dataService.getData(CONSTANTS.URLS.EMPLOYEES_GETFORDD, null, function (employees) {
                employees = _.map(employees.data, function (employee) {
                    employee.name = employee.name.first + ' ' + employee.name.last;

                    return employee
                });

                self.responseObj['#employee'] = employees;
            });

            dataService.getData('/bonusType/getForDD', null, function (bonusTypes) {
                self.responseObj['#bonusType'] = bonusTypes.data;
            });

            setTimeout(function () {
                self.editCollection = new editCollection(self.collection.toJSON());
                self.editCollection.on('saved', self.savedNewModel, self);
                self.editCollection.on('updated', self.updatedOptions, self);

                self.$listTable = $('#listTable');
            }, 10);

            $(document).on('click', function (e) {
                self.hideNewSelect(e);
            });

            $currentEl.append('<div id="timeRecivingDataFromServer">Created in ' + (new Date() - this.startTime) + ' ms</div>');
        },

        showDialog: function (e) {
            var targetEl = $(e.target);
            var tr = targetEl.closest('tr');
            var id = tr.attr('data-id');
            var requestedUrl = 'payment/';

            dataService.getData(requestedUrl, {viewType: 'form', id: id}, function (response) {
                if (!response.error) {
                    return new DialogView(response.success);
                } else {
                    App.render({
                        type   : 'error',
                        message: 'Something went wrong'
                    });
                }
            });
        }
    });

    return PaymentListView;
});