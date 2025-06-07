# Todo

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.0.0.

## components
 Responsible for viewing data in the template
 - template .html
 - style .css
 - code .ts

 export class classname - this is used when we are trying to access the class outside the module.

 ng generate component my-component --standalone --skip-import

## stand alone components
Angular has introduced a novel functionality known as Angular standalone components. These components streamline the process of Angular development and minimize the need for repetitive code. Unlike conventional Angular modules, you DO NOT need to have NgModule files for standalone components. Consequently, you can effortlessly import and utilize them in any section of an application.

Benefits
    - Improved Developer Experience
    - Reduced boilerplate
    - Increased modularity
    - Improved performance

## two way data binding
The change in model reflected back in the view and the change in view reflected back in the model. This can be done by using [(ngModel)]

## Angular Modules
whenever you want to reuse the component you need to import specific angular module, whenever you create component you need to associate with angular module.

## Routing
Routing helps to Move from One component to another component   

## service
Service is a functionility that is shared or common accross all the components,
A component can access the service by using constructor dependency injection,
service can be shared by all the components by using @Injectable annotation.ng 

## Route guard service
Route guards are used to control access to parts of your application by checking certain conditions before a route is activated. This schematic generates a new guard with the specified name, type, and options.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
