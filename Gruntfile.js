module.exports = function (grunt) {
    'use strict';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        watch: {
            scripts: {
                files: ['src/js/selectopus.js', 'src/js/i18n/*.js', 'src/css/selectopus.css'],
                tasks: [
                    'default'
                ],
                options: {
                    interrupt: true
                }
            }
        },

        concat: {
            main: {
                files: {
                    'dist/js/selectopus.js': [
                        'src/js/selectopus.js'
                    ],
                    'dist/js/selectopus.full.js': [
                        'src/js/selectopus.js',
                        'src/js/i18n/*.js'
                    ]
                }
            }
        },

        cssmin: {
            target: {
                files: {
                    'dist/css/selectopus.min.css': 'src/css/selectopus.css'
                }
            }
        },

        uglify: {
            dev: {
                files: {
                    'dist/js/selectopus.min.js': 'src/js/selectopus.js',
                    'dist/js/selectopus.full.min.js': 'dist/js/selectopus.full.js'
                }
            }
        },

        copy: {
            main: {
                files: [
                    {
                        expand: true,
                        cwd: 'src/js',
                        src: 'selectopus.js',
                        dest: 'dist/js'
                    },
                    {
                        expand: true,
                        cwd: 'src/js/i18n',
                        src: '*.js',
                        dest: 'dist/js/i18n'
                    },
                    {
                        expand: true,
                        cwd: 'src/css',
                        src: 'selectopus.css',
                        dest: 'dist/css/'
                    },
                    {
                        expand: true,
                        cwd: 'dist/js',
                        src: 'selectopus.full.min.js',
                        dest: 'docs/js/'
                    },
                    {
                        expand: true,
                        cwd: 'dist/css',
                        src: 'selectopus.min.css',
                        dest: 'docs/css/'
                    }
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', [
        'copy',
        'concat',
        'cssmin',
        'uglify'
    ]);
};
