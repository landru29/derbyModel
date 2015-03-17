/*jslint nomen: true*/
/*global require, module,  __dirname */

module.exports = function (grunt) {
    "use strict";

    // Load Grunt tasks declared in the package.json file
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    // Configure Grunt
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),
        project: {
            build: './build',
            app: './app'
        },

        /*************************************************/
        /** TASK USED IN GRUNT SERVE                    **/
        /*************************************************/
        express: { // create a server to localhost
            dev: {
                options: {
                    bases: ['<%= project.build%>', '<%= project.app%>', __dirname],
                    port: 9000,
                    hostname: "0.0.0.0",
                    livereload: true
                }
            },
            prod_check: {
                options: {
                    bases: [__dirname + '/<%= project.dist%>'],
                    port: 3000,
                    hostname: "0.0.0.0",
                    livereload: true
                }
            }
        },

        open: { // open application in Chrome
            dev: {
                path: 'http://localhost:<%= express.dev.options.port%>',
                app: 'google-chrome'
            },
            prod_check: {
                path: 'http://localhost:<%= express.prod_check.options.port%>',
                app: 'google-chrome'
            }
        },

        watch: { // watch files, trigger actions and perform livereload
            dev: {
                files: ['<%= project.app%>/index.html', '<%= project.app%>/scripts/**/*.js', '<%= project.app%>/styles/**/*', '<%= project.app%>/views/**'],
                tasks: [
                    'sass:dist',
                    'copy:dev',
                    'jshint'
                ],
                options: {
                    livereload: true
                }
            },
            prod_check: {
                files: ['<%= project.dist%>/**'],
                options: {
                    livereload: true
                }
            }
        },

        jshint: {
            dev: [
                '<%= project.app%>/scripts/**/*.js',
                'Gruntfile.js'
            ]
        },
        
        cssmin: {
            dist: {
                files: [
                    {
                        dest: '<%= pkg.name%>.min.css',
                        src: ['css/*.css']
                    }
                ]
            }
        },
        
        concat: { // concatenate JS files in one
            options: {
                // define a string to put between each file in the concatenated output
                separator: ';'
            },
            dist: {
                // the files to concatenate
                src: [
                    'lib/derby-simulator.js',
                    'lib/*.js',
                ],
                // the location of the resulting JS file
                dest: '<%= pkg.name %>.js'
            }
        },
        
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %> Cyrille MEICHEL <cmeichel@free.fr> */'
            },
            dist: {
                files: {
                    '<%= pkg.name%>.min.js': ['<%= pkg.name %>.js']
                }
            }
        }
    });


    grunt.registerTask('serve', [
        'express:dev',
        'open:dev',
        'watch:dev'
    ]);

    grunt.registerTask('build', [
        'jshint:dev',
        'cssmin:dist',
        'concat:dist',
        'uglify:dist'
    ]);

    grunt.registerTask('default', ['build']);
};