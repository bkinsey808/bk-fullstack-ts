library angular2.src.core.compiler.directive_lifecycle_reflector;

import 'package:angular2/src/core/metadata.dart';
import 'package:angular2/src/core/compiler/interfaces.dart';
import 'package:angular2/src/reflection/reflection.dart';

bool hasLifecycleHook(LifecycleEvent e, type, DirectiveMetadata annotation) {
  if (annotation.lifecycle != null) {
    return annotation.lifecycle.contains(e);
  } else {
    if (type is! Type) return false;

    final List interfaces = reflector.interfaces(type);
    var interface;

    if (e == LifecycleEvent.onChange) {
      interface = OnChange;
    } else if (e == LifecycleEvent.onDestroy) {
      interface = OnDestroy;
    } else if (e == LifecycleEvent.onAllChangesDone) {
      interface = OnAllChangesDone;
    } else if (e == LifecycleEvent.onCheck) {
      interface = OnCheck;
    } else if (e == LifecycleEvent.onInit) {
      interface = OnInit;
    }

    return interfaces.contains(interface);
  }
}
