views.App = Backbone.View.extend({
    events: {
        'click a.filter': 'setFilter',
        'keyup #filters-search': 'searchFilter',
        'click #filters .label': 'collapseFilter',
        'click button.btn-mini': 'toggleChart',
        'click .map-btn': 'mapLayerswitch',
        'click .reset': 'clearForm'
    },

    initialize: function(options) {
        var view = this;

        this.render();

        // Filters follow scrolling
        var top = $('#filters').offset().top - parseFloat($('#filters').css('marginTop').replace(/auto/, 0));
        $(window).on('scroll', function () {
            var y = $(this).scrollTop();
            if (y >= top) {
                $('#filters').addClass('fixed');
            } else {
                $('#filters').removeClass('fixed');
            }
        });

        // Minimum height so search field doesn't jump around
        this.$el.css('min-height', $(window).height() * 2);
        $(window).resize(_.debounce(function() {
            view.$el.css('min-height', $(window).height() * 2);
        }, 300));

        // Set up help popovers
        $('.help-note').popover({ trigger: 'hover' });
    },

    render: function() {
        this.$el.empty().append(templates.app(this));
        window.setTimeout(function() { $('html, body').scrollTop(0); }, 0);

        return this;
    },

    setFilter: function(e) {
        var $target = $(e.target),
            path = '',
            filters = [{
                collection: $target.attr('id').split('-')[0],
                id: $target.attr('id').split('-')[1]
            }],
            shift = false;

        _(this.filters).each(function(filter) {
            if (_.isEqual(filter, filters[0])) {
                shift = true;
            } else if (filter.collection !== filters[0].collection) {
                filters.push(filter);
            }
        });
        if (shift) filters.shift();

        filters = _(filters).chain()
            .compact()
            .map(function(filter) {
                return filter.collection + '-' + filter.id;
            })
            .value().join('/');

        path = (filters.length) ? 'filter/' + filters : 'filter/';

        e.preventDefault();

        $('#all-projects').attr('href', '#' + path);
        app.navigate(path, { trigger: true });
    },

    searchFilter: function(e) {
        var $target = $(e.target),
                val = $target.val().toLowerCase();

        _(this.views).each(function(view) {
            view.collection.each(function(model) {
                var name = model.get('name').toLowerCase();

                if (val === '' || name.indexOf(val) >= 0) {
                    model.set('visible', true);
                } else {
                    model.set('visible', false);
                }
            });

            view.render();
        });

        // Open all filter facets on search
        if (val === '') {
            $('ul.filter-items').removeClass('active');
            $('#filter-items .label').removeClass('active');
        } else {
            $('ul.filter-items').addClass('active');
            $('#filter-items .label').addClass('active');
        }
    },

    clearForm: function(e) {
        $(e.target).parent().find('input').val('');
        return false;
    },

    collapseFilter: function (e) {
        if ($(e.target).hasClass('icon')) {
            var $target = $(e.target).parent();
        } else {
            var $target = $(e.target);
        }
        var list = $target.next(),
            cat = $target.parent().parent().parent().attr('id');
            
        if (list.hasClass('active')) {
            list.removeClass('active');
            $target.removeClass('active');
            this.views[cat].active = false;
        } else {
            list.addClass('active');
            $target.addClass('active');
            this.views[cat].active = true;
        }
    },

    mapLayerswitch: function (e) {
        var $target = $(e.currentTarget);
        $('.map-btn').removeClass('active');
        $target.addClass('active');
        app.projects.map.updateMap($target.attr('data-value'));
    },

    toggleChart: function (e) {
        var $target = $(e.target);
        var facet = $target.attr('data-facet');
        $('.btn-' + facet + ' button').removeClass('active');
        $target.addClass('active');
        if ($target.html() == 'Budget') {
            $target.parent().parent().children('.chart-legend').css('display','block');
        } else {
            $target.parent().parent().children('.chart-legend').css('display','none');
        }
        this.views[facet].render();
    }
});
