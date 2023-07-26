CozynibiHotel - WEB ADMIN TEMPLATE

This is ASP.NET CORE MVC 6.0 using ajax to request and take the response
# I.Technologies:
    - Language: C#
    - Framework: ASP.NET CORE 6 MCV
    - HTTP REQUEST: jquery AJAX

# II. Libraries (CDN link)
    - ckeditor
    - toastjs
    - jquery
    - boostrap 5.0
    - jwt_decode
    - html5-qrcode
    - tiny-slider
    - tom-select

# III. Solution details
1. Solution Structure
    - Controller and Views: Framework of ASP.NET 6 MVC (just using Controller and Views), Controller url is following structure of Views file
    - Components: Using ViewsComponent setup in Components folder
    - Attributes: Custome Authorize attributes
    - Models: declare some model to contain the data for each component
    - wwwroot: static file: images, js, css, ...
    - Views/Shared: 
        + _Layout.cshtml: contains layout of template(header, footer, ...)
        + Components: contains views of these components 
    - Views/<Files>: Every files are using this files structure
        + Index.cshtml
        + AddNew.cshtml
        + Edit.cshtml
        + Trash.cshtml
    - wwwroot/js/<file.js>: : Every js files are using this files structure
        + <file>-index.js
        + <file>-addNew.js
        + <file>-edit.js
        + <file>-trash.js

2. Workings and Set up
    * Working: 
        - Authentication: Custome Authorize Attributes - if success then save access token and refesh token in cookie
        - HTTP Request: AJAX send request with Authentication Bearer in the header
    * Set up:
        - in env.js file: set up your api host 
# IV. How to use
    * Make sure that you got the api server, if not please clone and following the instructions of this repository to get the api server: https://github.com/hugnt/CozynibiHotel-Web-API
    - STEP 1: CLONE this repo
    - STEP 2: CONECT with server API by changing parameter in env.js file(wwwroot/js) 
    - STEP 3: Login or Register a new account

