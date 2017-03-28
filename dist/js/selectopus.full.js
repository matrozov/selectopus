(function($) {
    function Selectopus($element, options) {
        var self = {
            _items: {},
            _value: {},

            _languages: {},
            _options: {},

            _search: '',

            $element: false,

            $root: false,
            $items: false,
            $popup: false,
            $popupInput: false,
            $popupItems: false,
            $popupHint: false,

            init: function($element, options) {
                self.$element = $element;
                self.$element.hide();

                self._languages = $.fn.selectopus.languages;
                self._options   = $.extend({}, $.fn.selectopus.default, self.optionsPredefined(), options);

                self.create();

                self.public.language = self._options.language;
                self.public.items    = self._options.items;
                self.public.value    = self._options.value;

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

                self.$items = $('<div>')
                    .addClass('selectopus-items clearfix')
                    .appendTo(self.$root);

                self.$popup = $('<div>')
                    .addClass('selectopus-popup')
                    .appendTo('body');

                self.$popupInput = $('<input>')
                    .attr('type', 'text')
                    .addClass('selectopus-popup-input form-control input-sm')
                    .keyup(self.view.popup.onSearch)
                    .appendTo(self.$popup);

                self.$popupItems = $('<ul>')
                    .addClass('selectopus-popup-items')
                    .appendTo(self.$popup);

                self.$popupHint = $('<div>')
                    .addClass('selectopus-popup-hint')
                    .appendTo(self.$popup);

                $(document).click(self.view.popup.onClose);
            },

            optionsPredefined: function() {
                var result = {
                    items: {},
                    value: [],
                    multiple: self.$element.is('[multiple]')
                };

                self.$element.find('option').each(function() {
                    var $option = $(this);

                    var value = $option.prop('value');

                    result.items[value] = $option.text();

                    if ($option.prop('selected')) {
                        if (result.multiple) {
                            result.value.push(value);
                        }
                        else {
                            result.value = value;
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

                var data_str = ['language', 'url'];

                $.each(data_str, function(idx, key) {
                    var value = $element.data(key);

                    if ((typeof(value) !== 'undefined') && (value.trim().length > 0)) {
                        result[key] = value;
                    }
                });

                var data_bool = ['multiple', 'popupHideSelected', 'popupSearchHide', 'popupSearchHighlight', 'popupCloseAfterSelect'];

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
                }
            },

            items: {
                load: function(callback) {
                    self._options.onLoad(self.public, self._search, function(items) {
                        self._items = items;

                        callback();
                    });
                },

                exists: function(value) {
                    return typeof(self._items[value]) !== 'undefined';
                },

                get: function(value) {
                    if (!self.items.exists(value)) {
                        return undefined;
                    }

                    return self._items[value];
                }
            },

            value: {
                keys: function() {
                    var list = [];

                    $.each(self._value, function(value, title){
                        list.push(value);
                    });

                    return list;
                },

                exists: function(value) {
                    return typeof(self._value[value]) !== 'undefined';
                },

                save: function() {
                    self.$element.empty();

                    $.each(self._value, function(key, value) {
                        $('<option>')
                            .attr('selected', true)
                            .text(value)
                            .appendTo(self.$element);
                    });
                },

                addList: function(values) {
                    $.each(values, function (key, value) {
                        self.value.add(value);
                    });
                },

                add: function(value) {
                    self._value[value] = self.items.exists(value) ? self.items.get(value) : self.value.get(value);

                    self.$element.trigger('selectopus-select', value);
                    self.$element.trigger('selectopus-change');
                    self.$element.trigger('change');
                },

                remove: function(value) {
                    delete self._value[value];

                    self.$element.trigger('selectopus-unselect', value);
                    self.$element.trigger('selectopus-change');
                    self.$element.trigger('change');
                },

                get: function(value) {
                    if (!self.value.exists(value)) {
                        return undefined;
                    }

                    return self._value[value];
                },

                clear: function() {
                    self._value = {};
                }
            },

            view: {
                items: {
                    createList: function() {
                        self.view.items.clear();

                        $.each(self._value, function(value) {
                            self.view.items.create(value);
                        });
                    },

                    create: function(value) {
                        $('<span>')
                            .addClass('selectopus-item')
                            .html(self._options.onRenderItem(self.public, value, self.value.get(value)))
                            .data('value', value)
                            .click(self.view.items.onClick)
                            .appendTo(self.$items);
                    },

                    clear: function() {
                        self.$items.empty();
                    },

                    onClick: function() {
                        if (!self._options.multiple) {
                            return true;
                        }

                        var value = $(this).data('value');

                        if (self.value.exists(value)) {
                            self.value.remove(value);
                            self.value.save();

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

                            $.each(self._items, function(value, title){
                                var selected = self.value.exists(value);

                                if (selected && (self._options.popupHideSelected)) {
                                    return;
                                }

                                items[value] = title;
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

                                self.$popupHint.show();
                            }
                            else {
                                self.$popupHint.hide();
                            }
                        },

                        create: function(value) {
                            var content  = self._options.onRenderPopupItem(self.public, value, self.items.get(value), self._search);

                            var $item = $('<li>')
                                .addClass('selectopus-popup-item')
                                .html(content)
                                .data('value', value)
                                .click(self.view.popup.items.onClick)
                                .appendTo(self.$popupItems);

                            if (self.value.exists(value)) {
                                $item.addClass('selectopus-popup-item-selected');
                            }
                        },

                        clear: function() {
                            self.$popupItems.empty();
                        },

                        onClick: function() {
                            var value = $(this).data('value');

                            if (self._options.multiple && self.value.exists(value)) {
                                self.value.remove(value);
                                self.value.save();
                            }
                            else {
                                if (!self._options.multiple) {
                                    self.value.clear();
                                }

                                self.value.add(value);
                                self.value.save();
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

                            self.$popup.show();

                            self.$popupItems.scrollTop(0);
                            self.$popupInput.val('').focus();
                        });

                    },

                    close: function() {
                        if (!self.view.popup.isOpened) {
                            return;
                        }

                        self.$popup.hide();

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

                get value() {
                    if (self._options.multiple) {
                        return self.value;
                    }
                    else {
                        return self.value[0];
                    }
                },

                set value(value) {
                    if (self._options.multiple) {
                        if ($.isArray(value)) {
                            self.value.clear();
                            self.value.addList(value);
                        }
                    }
                    else {
                        self.value.addList([value]);
                    }

                    self.value.save();
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

                    markup: function(text, search) {
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
        items: {}, // List of allowed items {value1: title1, value2: title2}
        value: [], // List of values [value1, value2]

        language: 'en',
        multiple: false, // Allow multiple select

        popupHideSelected: false, // hide selected items (or only hightlite by default)
        popupSearchHide: true, // hide not matched items
        popupSearchHighlight: true, // highlight match items
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
            if (!selectopus.options.popupSearchHide || (typeof(search) === 'undefined') || (search.trim().length === 0)) {
                return selectopus.items;
            }

            var items = {};

            $.each(selectopus.items, function(value, title) {
                if (!selectopus.utils.match(title, search)) {
                    return;
                }

                items[value] = title;
            });

            return items;
        },
        onRenderItem: function(selectopus, value, title) {
            return title;
        },
        onRenderPopupItem: function(selectopus, value, title, search) {
            if (selectopus.options.popupSearchHighlight) {
                title = selectopus.utils.markup(title, search);
            }

            return title;
        }
    };
    
    $('body').ready(function() {
        $('.selectopus').selectopus();
    });

    $.fn.selectopus.languages = {};
})(jQuery);
(function($) {
    $.fn.selectopus.languages.en = {
        popupEmpty: 'Empty list!',
        popupSearchPlaceholder: 'Start type for search items...',
        popupSearchNotFound: 'No results found!'
    };
})(jQuery);
(function($) {
    $.fn.selectopus.languages.ru = {
        popupEmpty: 'Список пуст!',
        popupSearchPlaceholder: 'Начните писать, что бы найти элементы...',
        popupSearchNotFound: 'Совпадений не найдено!'
    };
})(jQuery);