"use strict";

 angular.module('envconfig', [])

.constant('ENV', {name:'dev',apiEndpoint:'http://localhost:1337',cdnUrl:'https://d116li125og699.cloudfront.net',adminUrl:'http://localhost:3000',tokenPrefix:'dev'})

;