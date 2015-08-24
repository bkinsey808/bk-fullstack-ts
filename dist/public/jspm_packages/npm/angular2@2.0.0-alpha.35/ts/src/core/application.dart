library angular2.application;

import 'dart:async';

import 'package:angular2/src/reflection/reflection.dart' show reflector;
import 'package:angular2/src/reflection/reflection_capabilities.dart'
    show ReflectionCapabilities;
import 'application_common.dart';

export 'application_common.dart' show ApplicationRef;

/// Starts an application from a root component. This implementation uses
/// mirrors. Angular 2 transformer automatically replaces this method with a
/// static implementation (see `application_static.dart`) that does not use
/// mirrors and produces a faster and more compact JS code.
///
/// See [commonBootstrap] for detailed documentation.
Future<ApplicationRef> bootstrap(Type appComponentType,
    [List componentInjectableBindings]) {
  reflector.reflectionCapabilities = new ReflectionCapabilities();
  return commonBootstrap(appComponentType, componentInjectableBindings);
}
