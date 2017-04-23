(function($) {
    function Selectopus($element, options) {
        var self = {
            _items: {},
            _values: {},

            _languages: {},
            _options: {},

            _search: '',

            $element: false,

            $root: false,
            $placeholder: false,
            $items: false,
            $clear: false,
            $popup: false,
            $popupInput: false,
            $popupItems: false,
            $popupCreate: false,
            $popupHint: false,

            init: function($element, options) {
                self.$element = $element;
                self.$element.hide();

                self._languages = $.fn.selectopus.languages;
                self._options   = $.extend({}, $.fn.selectopus.default, self.optionsPredefined(), options);

                self.create();

                self.public.language = self._options.language;
                self.public.items    = self._options.items;
                self.public.values   = self._options.values;

                self.view.items.createList();
            },

            create: function() {
                self.$root = $('<div>')
                    .addClass('selectopus-root form-control')
                    .click(self.view.popup.onToggle)
                    .insertAfter(self.$element);

                if (self._options.multiple) {
                    self.$root.addClass('selectopus-multiple');
                }

                self.$placeholder = $('<div>')
                    .addClass('selectopus-placeholder text-muted')
                    .appendTo(self.$root);

                self.$items = $('<div>')
                    .addClass('selectopus-items clearfix')
                    .appendTo(self.$root);

                self.$clear = $('<div>')
                    .addClass('selectopus-clear')
                    .html('&#x2716;')
                    .click(self.view.items.onClear)
                    .appendTo(self.$root);

                if (self._options.required) {
                    self.$clear.hide();
                }

                self.$popup = $('<div>')
                    .addClass('selectopus-popup dropdown-menu');

                self.$popupInput = $('<input>')
                    .attr('type', 'text')
                    .addClass('selectopus-popup-input form-control input-sm')
                    .keyup(self.view.popup.onSearch)
                    .appendTo(self.$popup);

                if (!self._options.popupSearchBar) {
                    self.$popupInput.hide();
                }

                self.$popupItems = $('<ul>')
                    .addClass('selectopus-popup-items')
                    .appendTo(self.$popup);

                self.$popupCreate = $('<li>')
                    .addClass('selectopus-popup-item selectopus-popup-create')
                    .text('create new item')
                    .click(self.view.popup.items.onClick)
                    .appendTo(self.$popupItems);

                self.$popupHint = $('<div>')
                    .addClass('selectopus-popup-hint')
                    .appendTo(self.$popup);

                $(document).click(self.view.popup.onClose);
            },

            optionsPredefined: function() {
                var result = {
                    items: {},
                    values: []
                };

                self.$element.find('option').each(function() {
                    var $option = $(this);

                    var value = $option.prop('value');

                    if (typeof(value) === 'undefined') {
                        value = $option.text();
                    }

                    result.items[value] = $option.text();

                    if ($option.prop('selected')) {
                        if (result.multiple) {
                            result.values.push(value);
                        }
                        else {
                            result.values = [value];
                        }
                    }
                });

                var language = $element.attr('lang');

                if (self.language.exists(language)) {
                    result.language = language;
                }
                else {
                    language = $('html').attr('lang');

                    if (self.language.exists(language)) {
                        result.language = language;
                    }
                }

                var attr_str = ['placeholder'];

                $.each(attr_str, function(idx, key) {
                    var value = $element.attr(key);

                    if ((typeof(value) !== 'undefined') && (value.trim().length > 0)) {
                        result[key] = value;
                    }
                });

                var attr_bool = ['required', 'multiple'];

                $.each(attr_bool, function(idx, key) {
                    var value = $element.attr(key);

                    if (typeof(value) !== 'undefined') {
                        result[key] = true;
                    }
                });

                var data_str = ['language', 'placeholder', 'url'];

                $.each(data_str, function(idx, key) {
                    var value = $element.data(key);

                    if ((typeof(value) !== 'undefined') && (value.trim().length > 0)) {
                        result[key] = value;
                    }
                });

                var data_bool = ['required', 'multiple', 'allowCreate', 'popupHideSelected', 'popupSearchBar', 'popupSearchHideItem', 'popupSearchMarkItem', 'popupCloseAfterSelect'];

                $.each(data_bool, function(idx, key) {
                    var value = $element.data(key);

                    if (typeof(value) !== 'undefined') {
                        result[key] = ((value === 'true') || (value === '1'));
                    }
                });

                return result;
            },

            language: {
                exists: function(value) {
                    return typeof(self._languages[value]) !== 'undefined';
                },

                translate: function(value) {
                    return self._languages[self._options.language][value];
                },

                set: function(value) {
                    if (!self.language.exists(value)) {
                        return;
                    }

                    self._options.language = value;

                    self.language.reload();
                },

                reload: function() {
                    self.$popupInput.attr('placeholder', self.language.translate('popupSearchPlaceholder'));

                    var placeholder = self._options.placeholder;

                    if (!placeholder) {
                        placeholder = self.language.translate('placeholder');
                    }

                    self.$placeholder.text(placeholder);
                }
            },

            items: {
                load: function(callback) {
                    self._options.onLoad(self.public, self._search, function(items) {
                        self._items = items;

                        callback();
                    });
                },

                add: function(value, data) {
                    self._options.items[value] = data;
                    self._items[value] = data;
                },

                exists: function(value) {
                    return typeof(self._items[value]) !== 'undefined';
                },

                get: function(value) {
                    if (!self.items.exists(value)) {
                        return undefined;
                    }

                    if ($.isPlainObject(self._items[value])) {
                        return jQuery.extend({}, self._items[value]);
                    }
                    else {
                        return self._items[value];
                    }
                }
            },

            values: {
                keys: function() {
                    var list = [];

                    $.each(self._values, function(value){
                        list.push(value);
                    });

                    return list;
                },

                exists: function(value) {
                    return typeof(self._values[value]) !== 'undefined';
                },

                save: function() {
                    self.$element.empty();

                    self.$element.attr('multiple', self._options.multiple);

                    $.each(self._values, function(value) {
                        $('<option>')
                            .attr('selected', true)
                            .text(value)
                            .appendTo(self.$element);
                    });
                },

                addList: function(values) {
                    if ($.isArray(values)) {
                        $.each(values, function(key, value) {
                            self.values.add(value);
                        });
                    }
                    else {
                        $.each(values, function(key, value) {
                            self.values.add(key, value);
                        });
                    }
                },

                add: function(value, data) {
                    if (typeof(data) !== 'undefined') {
                        self._values[value] = data;
                    }
                    else {
                        self._values[value] = self.items.exists(value) ? self.items.get(value) : self.values.get(value);
                    }

                    self.$element.trigger('selectopus-select', value);
                    self.$element.trigger('selectopus-change');
                    self.$element.trigger('change');
                },

                remove: function(value) {
                    delete self._values[value];

                    self.$element.trigger('selectopus-unselect', value);
                    self.$element.trigger('selectopus-change');
                    self.$element.trigger('change');
                },

                get: function(value) {
                    if (!self.values.exists(value)) {
                        return undefined;
                    }

                    if ($.isPlainObject(self._values[value])) {
                        return jQuery.extend({}, self._values[value]);
                    }
                    else {
                        return self._values[value];
                    }
                },

                clear: function() {
                    self._values = {};
                }
            },

            view: {
                items: {
                    createList: function() {
                        self.view.items.clear();

                        if ($.isEmptyObject(self._values)) {
                            self.$placeholder.show();
                            self.$clear.hide();
                        }
                        else {
                            self.$placeholder.hide();

                            if (!self._options.required) {
                                self.$clear.show();
                            }
                        }

                        $.each(self._values, function(value) {
                            self.view.items.create(value);
                        });
                    },

                    create: function(value) {
                        var data = self.values.get(value);

                        $('<span>')
                            .addClass('selectopus-item')
                            .html(self._options.onRenderItem(self.public, value, self._options.onGetLabel(self.public, data), data))
                            .data('value', value)
                            .click(self.view.items.onClick)
                            .appendTo(self.$items);
                    },

                    clear: function() {
                        self.$items.empty();
                    },

                    onClear: function() {
                        self.values.clear();
                        self.view.items.createList();

                        return false;
                    },

                    onClick: function() {
                        if (!self._options.multiple) {
                            return true;
                        }

                        var value = $(this).data('value');

                        if (self.values.exists(value)) {
                            self.values.remove(value);
                            self.values.save();

                            self.view.items.createList();
                        }

                        self.view.popup.close();

                        return false;
                    }
                },

                popup: {
                    items: {
                        createList: function() {
                            self.view.popup.items.clear();

                            self._items = self._options.onSearch(self.public, self._search);

                            var items = {};

                            $.each(self._items, function(value, data){
                                var selected = self.values.exists(value);

                                if (selected && (self._options.popupHideSelected)) {
                                    return;
                                }

                                items[value] = data;
                            });

                            $.each(items, function(value) {
                                self.view.popup.items.create(value, self._search);
                            });

                            if ($.isEmptyObject(items)) {
                                if (self._search.length > 0) {
                                    self.$popupHint.text(self.language.translate('popupSearchNotFound'));
                                }
                                else {
                                    self.$popupHint.text(self.language.translate('popupEmpty'));
                                }

                                self.$popupHint.css('display', 'block');
                            }
                            else {
                                self.$popupHint.css('display', 'none');
                            }
                        },

                        create: function(value) {
                            var data    = self.items.get(value);
                            var label   = self._options.onGetLabel(self.public, data);

                            if (self._options.popupSearchMarkItem) {
                                label = self.public.utils.mark(label, self._search);
                            }

                            var content = self._options.onRenderPopupItem(self.public, value, label, data);

                            var $item = $('<li>')
                                .addClass('selectopus-popup-item')
                                .html(content)
                                .data('value', value)
                                .click(self.view.popup.items.onClick)
                                .appendTo(self.$popupItems);

                            if (self.values.exists(value)) {
                                $item.addClass('selectopus-popup-item-selected');
                            }
                        },

                        clear: function() {
                            self.$popupItems.find('.selectopus-popup-item:not(.selectopus-popup-create)').remove();
                        },

                        onClick: function() {
                            var value = $(this).data('value');

                            if ($(this).is('.selectopus-popup-create')) {
                                self.items.add(value, self._options.onCreateItem(self.public, value));
                            }

                            if (self._options.multiple) {
                                if (self.values.exists(value)) {
                                    self.values.remove(value);
                                    self.values.save();
                                }
                                else {
                                    self.values.add(value);
                                    self.values.save();
                                }
                            }
                            else {
                                if (self.values.exists(value)) {
                                    if (!self._options.required) {
                                        self.values.remove(value);
                                        self.values.save();
                                    }
                                }
                                else {
                                    self.values.clear();
                                    self.values.add(value);
                                    self.values.save();
                                }
                            }

                            if (self._options.popupCloseAfterSelect) {
                                self.view.popup.close();
                            }
                            else {
                                self.view.popup.items.createList();
                            }

                            self.view.items.createList();

                            return false;
                        }
                    },

                    get isOpened() {
                        return self.$popup.is(':visible');
                    },

                    toggle: function() {
                        if (self.view.popup.isOpened) {
                            self.view.popup.close();
                        }
                        else {
                            self.view.popup.open();
                        }
                    },

                    open: function() {
                        $(document).trigger('click');

                        self.items.load(function() {
                            self.view.popup.items.createList();

                            var bound = self.$root[0].getBoundingClientRect();

                            self.$popup.css('width', bound.width);
                            self.$popup.css('left', bound.left + $('body').scrollLeft());
                            self.$popup.css('top', bound.bottom + $('body').scrollTop());

                            self.$popup.appendTo('body');

                            self.$popupItems.scrollTop(0);
                            self.$popupInput.val('').focus();
                            self.$popupCreate.hide();
                        });

                    },

                    close: function() {
                        if (!self.view.popup.isOpened) {
                            return;
                        }

                        self.$popup.detach();

                        self.view.popup.items.clear();

                        self._search = '';
                    },

                    onToggle: function() {
                        self.view.popup.toggle();

                        return false;
                    },

                    onOpen: function() {
                        self.view.popup.open();

                        return false;
                    },

                    onClose: function(event) {
                        if (!self.view.popup.isOpened) {
                            return true;
                        }

                        var $target = $(event.target);

                        if ($target[0] === self.$popup[0]) {
                            return true;
                        }

                        var $parent = $target.parents('.selectopus-popup:first');

                        if (($parent.length > 0) && ($parent[0] === self.$popup[0])) {
                            return true;
                        }

                        self.view.popup.close();

                        return false;
                    },

                    onSearch: function() {
                        self._search = self.$popupInput.val().trim();

                        self.items.load(function() {
                            if (self._search.length > 0) {
                                self.view.popup.items.createList();
                            }
                            else {
                                self.view.popup.items.createList();
                            }
                        });

                        if (self._options.allowCreate && (self._search.length > 0)) {
                            var data  = self._options.onCreateItem(self.public, self._search);
                            var label = self._options.onGetLabel(self.public, data);

                            if (self._options.popupSearchMarkItem) {
                                label = self.public.utils.mark(label, self._search);
                            }

                            self.$popupCreate
                                .data('value', self._search)
                                .html(self._options.onRenderPopupItem(self.public, self._search, label, data));

                            self.$popupCreate.show();
                        }
                        else {
                            self.$popupCreate.hide();
                        }
                    }
                }
            },

            public: {
                get options() {
                    return self._options;
                },

                get language() {
                    return self._options.language;
                },

                set language(value) {
                    self.language.set(value);
                },

                get items() {
                    return self._items;
                },

                set items(value) {
                    self._options.items = value;
                    self._items = value;
                },

                get values() {
                    return self.values.keys();
                },

                set values(values) {
                    self.values.clear();

                    self.values.addList(values);

                    self.values.save();
                    self.view.items.createList();

                },

                popup: {
                    get isOpened() {
                        return self.view.popup.isOpened;
                    },

                    toggle: function() {
                        self.view.popup.toggle();
                    },

                    open: function() {
                        self.view.popup.open();
                    },

                    close: function() {
                        self.view.popup.close();
                    }
                },

                utils: {
                    match: function(text, search) {
                        if ((typeof(text) !== 'string') || (typeof(search) !== 'string') || (search.trim().length === 0)) {
                            return text;
                        }

                        var regexp = new RegExp(search.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&"), 'gi');

                        return text.match(regexp);
                    },

                    mark: function(text, search) {
                        if ((typeof(text) !== 'string') || (typeof(search) !== 'string') || (search.trim().length === 0)) {
                            return text;
                        }

                        var regexp = new RegExp(search.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&"), 'gi');

                        return text.replace(regexp, function(s) {
                            return '<mark>' + s + '</mark>';
                        });
                    }
                }

            }
        };

        self.init($element, options);

        return self.public;
    }

    $.fn.selectopus = function(options) {
        return this.each(function() {
            var $element   = $(this);
            var selectopus = $element.data('selectopus');

            if (typeof(selectopus) === 'undefined') {
                selectopus = new Selectopus($element, options);

                $element.data('selectopus', selectopus)
            }

            return selectopus;
        }).data('selectopus');
    };

    $.fn.selectopus.default = {
        items: {}, // List of allowed items {value1: data1, value2: data2}
        values: [], // List of values [value1, value2]

        language: 'en',

        placeholder: false, // Custom placeholer

        required: false, // Allow empty value
        multiple: false, // Allow multiple select
        allowCreate: true, // Allow create new value

        popupHideSelected: false, // Hide selected items (or only hightlite by default)

        popupSearchBar: true, // Show search bar
        popupSearchHideItem: true, // Hide not matched items
        popupSearchMarkItem: true, // Mark match items

        popupCloseAfterSelect: true, // Close popup after select item

        url: false, // Url for ajax load, example: http://example.com?text=

        onLoad: function(selectopus, search, callback) {
            if (!selectopus.options.url) {
                callback(selectopus.options.items);
                return;
            }

            try {
                $.getJSON(selectopus.options.url + search, function(items) {
                    if (!$.isPlainObject(items)) {
                        callback({});
                        return;
                    }

                    callback(items);
                });
            }
            catch (e) {
                callback({});
            }
        },
        onSearch: function(selectopus, search) {
            if (!selectopus.options.popupSearchHideItem || (typeof(search) === 'undefined') || (search.trim().length === 0)) {
                return selectopus.items;
            }

            var items = {};

            $.each(selectopus.items, function(value, data) {
                if (!selectopus.utils.match(selectopus.options.onGetLabel(selectopus, data), search)) {
                    return;
                }

                items[value] = data;
            });

            return items;
        },
        onGetLabel: function(selectopus, data) {
            return data;
        },
        onRenderItem: function(selectopus, value, label, data) {
            return label;
        },
        onRenderPopupItem: function(selectopus, value, label, data) {
            return label;
        },
        onCreateItem: function(selectopus, label) {
            return label;
        }
    };
    
    $('body').ready(function() {
        $('.selectopus').selectopus();
    });

    $.fn.selectopus.languages = {};
})(jQuery);