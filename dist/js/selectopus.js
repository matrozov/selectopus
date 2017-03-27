(function($) {
    function Selectopus($element, options) {
        var self = {
            items: {},
            value: [],

            languages: {},
            options: {},

            $element: false,

            $root: false,
            $items: false,
            $input: false,
            $popup: false,

            init: function($element, options) {
                self.$element = $element;
                self.$element.hide();

                self.languages = $.fn.selectopus.languages;
                self.options   = $.extend({}, $.fn.selectopus.default, self.optionsPredefined(), options);

                self.create();

                self.public.language = self.options.language;
                self.public.items    = self.options.items;
                self.public.value    = self.options.value;

                self.itemsCreate();
            },

            create: function() {
                self.$root = $('<div>')
                    .addClass('selectopus-root')
                    .insertAfter(self.$element);

                if (self.options.multiple) {
                    self.$root.addClass('selectopus-multiple');
                }

                self.$items = $('<div>')
                    .addClass('selectopus-items form-control')
                    .click(self.onPopupToggle)
                    .appendTo(self.$root);

                self.$popup = $('<div>')
                    .addClass('selectopus-popup')
                    .appendTo('body');

                self.$input = $('<input>')
                    .attr('type', 'text')
                    .addClass('selectopus-popup-input form-control input-sm')
                    .keyup(self.onPopupSearch)
                    .appendTo(self.$popup);

                self.$popupItems = $('<ul>')
                    .addClass('selectopus-popup-items')
                    .appendTo(self.$popup);

                $(document).click(self.onPopupClose);
            },

            optionsPredefined: function() {
                var result = {
                    multiple: self.$element.is('[multiple]'),
                    items: {},
                    value: []
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

                var language = $('html').attr('lang');

                if (self.languageExists(language)) {
                    result.language = language;
                }

                return result;
            },

            languageExists: function(language) {
                return typeof(self.languages[language]) !== 'undefined';
            },

            languageGet: function(key) {
                return self.languages[self.options.language][key];
            },

            languageReload: function() {
                self.$input.attr('placeholder', self.languageGet('popupSearchPlaceholder'));
            },

            itemsClear: function() {
                self.$items.empty();
            },

            itemsCreate: function() {
                self.itemsClear();

                $.each(self.value, function(key, value) {
                    self.itemCreate(value);
                });
            },

            itemCreate: function(value) {
                return $('<span>')
                    .addClass('selectopus-item')
                    .html(self.options.onRenderItem(self.public, value, self.items[value]))
                    .data('value', value)
                    .click(self.onItemClick)
                    .appendTo(self.$items);
            },

            popupItemsClear: function() {
                self.$popupItems.empty();
            },

            popupItemsCreate: function(search) {
                self.popupItemsClear();

                self.items = self.options.onSearch(self, search);

                $.each(self.items, function(value) {
                    self.popupItemCreate(value, search);
                });
            },

            popupItemCreate: function(value, search) {
                var selected = self.value.indexOf(value) > -1;

                if (selected && (self.options.popupSelectedMode === 'hide')) {
                    return;
                }

                var $item = $('<li>')
                    .addClass('selectopus-popup-item')
                    .html(self.options.onRenderPopupItem(self.public, value, self.items[value], search))
                    .data('value', value)
                    .click(self.onPopupItemClick)
                    .appendTo(self.$popupItems);

                if (selected) {
                    $item.addClass('selectopus-popup-item-selected');
                }

                return $item;
            },

            saveValue: function() {
                self.$element.empty();

                $.each(self.value, function(key, value) {
                    $('<option>')
                        .attr('selected', true)
                        .text(value)
                        .appendTo(self.$element);
                });
            },

            onItemClick: function() {
                var value = $(this).data('value');
                var index = self.value.indexOf(value);

                if (self.options.onUnselect(self, value)) {
                    self.value.splice(index, 1);
                    self.public.value = self.value;
                }

                self.public.popupClose();

                return false;
            },

            onPopupToggle: function() {
                self.public.popupToggle();

                return false;
            },

            onPopupOpen: function() {
                self.public.popupOpen();

                return false;
            },

            onPopupClose: function(event) {
                var $target = $(event.target);

                if (($target[0] === self.$popup[0]) || ($target.parents('.selectopus-popup')[0] === self.$popup[0])) {
                    return false;
                }

                self.public.popupClose();

                return false;
            },

            onPopupItemClick: function() {
                var value = $(this).data('value');
                var index = self.value.indexOf(value);

                if (index > -1) {
                    if (self.options.onUnselect(self, value)) {
                        self.value.splice(index, 1);
                        self.public.value = self.value;
                    }
                }
                else {
                    if (self.options.onSelect(self, value)) {
                        if (self.options.multiple) {
                            self.value.push(value);
                            self.public.value = self.value;
                        }
                        else {
                            self.public.value = value;
                        }
                    }
                }

                if (self.options.popupCloseAfterSelect) {
                    self.public.popupClose();
                }

                return false;
            },

            onPopupSearch: function() {
                var search = self.$input.val().trim();

                if (search.length > 0) {
                    self.popupItemsCreate(search);
                }
                else {
                    self.popupItemsCreate();
                }
            },

            public: {
                get options() {
                    return self.options;
                },

                get language() {
                    return self.options.language;
                },

                set language(value) {
                    if (!self.languageExists(value)) {
                        return;
                    }

                    self.options.language = value;

                    self.languageReload();
                },

                get items() {
                    return self.items;
                },

                set items(value) {
                    self.items = value;
                },

                get value() {
                    if (self.options.multiple) {
                        return self.value;
                    }
                    else {
                        return self.value[0];
                    }
                },

                set value(value) {
                    if (self.options.multiple) {
                        if ($.isArray(value)) {
                            self.value = value;
                        }
                    }
                    else {
                        self.value = [value];
                    }

                    self.itemsCreate();
                    self.saveValue();
                },

                isPopupOpened: function() {
                    return self.$popup.is(':visible');
                },

                popupToggle: function() {
                    if (self.public.isPopupOpened()) {
                        self.public.popupClose();
                    }
                    else {
                        self.public.popupOpen();
                    }
                },

                popupOpen: function() {
                    self.popupItemsCreate();

                    var bound = self.$items[0].getBoundingClientRect();

                    self.$popup.css('width', bound.width);
                    self.$popup.css('left', bound.left);
                    self.$popup.css('top', bound.bottom);

                    self.$popup.show();

                    self.$popupItems.scrollTop(0);
                    self.$input.focus();
                },

                popupClose: function() {
                    self.$popup.hide();

                    self.popupItemsClear();
                },

                markup: function(text, search) {
                    if ((typeof(text) !== 'string') || (typeof(search) === 'undefined') || (search.trim().length === 0)) {
                        return text;
                    }

                    var regexp = new RegExp(search.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&"), 'gi');

                    return text.replace(regexp, function(s) {
                        return '<mark>' + s + '</mark>';
                    });
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

        popupSelectedMode: 'highlite', // highlite/hide
        popupSearchHighlight: true, // highlite match result
        popupCloseAfterSelect: true, // Close popup after select item

        onSearch: function(selectopus, search) {
            if ((typeof(search) === 'undefined') || (search.trim().length === 0)) {
                return selectopus.options.items;
            }

            var items = {};

            $.each(selectopus.options.items, function(value, title) {
                if (title.indexOf(search) === -1) {
                    return;
                }

                items[value] = title;
            });

            return items;
        },
        onSelect: function(selectopus, value) {
            return true;
        },
        onUnselect: function(selectopus, value) {
            return true;
        },
        onRenderItem: function(selectopus, value, title) {
            return title;
        },
        onRenderPopupItem: function(selectopus, value, title, search) {
            if (selectopus.options.popupSearchHighlight) {
                title = selectopus.markup(title, search);
            }

            return title;
        }
    };

    $('body').ready(function() {
        $('.selectopus').selectopus();
    });

    $.fn.selectopus.languages = {};
})(jQuery);