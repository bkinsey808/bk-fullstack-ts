System.config({
  baseURL: "/",
  defaultJSExtensions: true,
  transpiler: "typescript",
  paths: {
    "github:*": "jspm_packages/github/*",
    "npm:*": "jspm_packages/npm/*",
    "app": "dist/public"
  },
  bundles: {
    "build.js": [
      "components/app.js",
      "npm:angular2@2.0.0-alpha.35/angular2.js",
      "npm:angular2@2.0.0-alpha.35/metadata.js",
      "components/child/child.js",
      "npm:angular2@2.0.0-alpha.35/core.js",
      "npm:angular2@2.0.0-alpha.35/forms.js",
      "npm:angular2@2.0.0-alpha.35/di.js",
      "npm:angular2@2.0.0-alpha.35/render.js",
      "npm:angular2@2.0.0-alpha.35/change_detection.js",
      "npm:angular2@2.0.0-alpha.35/profile.js",
      "npm:angular2@2.0.0-alpha.35/directives.js",
      "npm:angular2@2.0.0-alpha.35/src/core/metadata.js",
      "services/api.js",
      "npm:angular2@2.0.0-alpha.35/src/core/application_tokens.js",
      "npm:angular2@2.0.0-alpha.35/src/core/application_common.js",
      "npm:angular2@2.0.0-alpha.35/src/util/decorators.js",
      "npm:angular2@2.0.0-alpha.35/src/services/app_root_url.js",
      "npm:angular2@2.0.0-alpha.35/src/facade/lang.js",
      "npm:angular2@2.0.0-alpha.35/src/core/compiler/directive_resolver.js",
      "npm:angular2@2.0.0-alpha.35/src/services/url_resolver.js",
      "npm:angular2@2.0.0-alpha.35/src/core/compiler/query_list.js",
      "npm:angular2@2.0.0-alpha.35/src/core/compiler/compiler.js",
      "npm:angular2@2.0.0-alpha.35/src/core/compiler/component_url_mapper.js",
      "npm:angular2@2.0.0-alpha.35/src/core/compiler/dynamic_component_loader.js",
      "npm:angular2@2.0.0-alpha.35/src/core/compiler/template_ref.js",
      "npm:angular2@2.0.0-alpha.35/src/core/life_cycle/life_cycle.js",
      "npm:angular2@2.0.0-alpha.35/src/core/compiler/view_manager.js",
      "npm:angular2@2.0.0-alpha.35/src/core/compiler/view_container_ref.js",
      "npm:angular2@2.0.0-alpha.35/src/core/compiler/element_ref.js",
      "npm:angular2@2.0.0-alpha.35/src/core/compiler/view_ref.js",
      "npm:angular2@2.0.0-alpha.35/src/forms/directives/abstract_control_directive.js",
      "npm:angular2@2.0.0-alpha.35/src/facade/async.js",
      "npm:angular2@2.0.0-alpha.35/src/forms/directives/control_container.js",
      "npm:angular2@2.0.0-alpha.35/src/forms/directives/ng_control_name.js",
      "npm:angular2@2.0.0-alpha.35/src/forms/directives/ng_model.js",
      "npm:angular2@2.0.0-alpha.35/src/forms/directives/ng_form_control.js",
      "npm:angular2@2.0.0-alpha.35/src/forms/directives/ng_control.js",
      "npm:angular2@2.0.0-alpha.35/src/forms/directives/ng_form_model.js",
      "npm:angular2@2.0.0-alpha.35/src/forms/directives/ng_form.js",
      "npm:angular2@2.0.0-alpha.35/src/core/zone/ng_zone.js",
      "npm:angular2@2.0.0-alpha.35/src/forms/directives/default_value_accessor.js",
      "npm:angular2@2.0.0-alpha.35/src/forms/directives/ng_control_group.js",
      "npm:angular2@2.0.0-alpha.35/src/forms/directives/checkbox_value_accessor.js",
      "npm:angular2@2.0.0-alpha.35/src/forms/model.js",
      "npm:angular2@2.0.0-alpha.35/src/forms/validators.js",
      "npm:angular2@2.0.0-alpha.35/src/forms/directives.js",
      "npm:angular2@2.0.0-alpha.35/src/forms/form_builder.js",
      "npm:angular2@2.0.0-alpha.35/src/forms/directives/select_control_value_accessor.js",
      "npm:angular2@2.0.0-alpha.35/src/forms/directives/validators.js",
      "npm:angular2@2.0.0-alpha.35/src/di/injector.js",
      "npm:angular2@2.0.0-alpha.35/src/di/metadata.js",
      "npm:angular2@2.0.0-alpha.35/src/di/decorators.js",
      "npm:angular2@2.0.0-alpha.35/src/di/forward_ref.js",
      "npm:angular2@2.0.0-alpha.35/src/di/binding.js",
      "npm:angular2@2.0.0-alpha.35/src/di/key.js",
      "npm:angular2@2.0.0-alpha.35/src/change_detection/change_detection.js",
      "npm:angular2@2.0.0-alpha.35/src/di/exceptions.js",
      "npm:angular2@2.0.0-alpha.35/src/profile/profile.js",
      "npm:angular2@2.0.0-alpha.35/src/directives/ng_class.js",
      "npm:angular2@2.0.0-alpha.35/src/directives/ng_for.js",
      "npm:angular2@2.0.0-alpha.35/src/di/opaque_token.js",
      "npm:angular2@2.0.0-alpha.35/src/directives/ng_if.js",
      "npm:angular2@2.0.0-alpha.35/src/directives/ng_switch.js",
      "npm:angular2@2.0.0-alpha.35/src/render/render.js",
      "npm:angular2@2.0.0-alpha.35/src/directives/ng_non_bindable.js",
      "npm:angular2@2.0.0-alpha.35/src/directives/ng_style.js",
      "github:jspm/nodelibs-process@0.1.1.js",
      "npm:angular2@2.0.0-alpha.35/src/core/metadata/di.js",
      "npm:angular2@2.0.0-alpha.35/src/core/metadata/directives.js",
      "npm:angular2@2.0.0-alpha.35/src/core/metadata/view.js",
      "npm:angular2@2.0.0-alpha.35/src/dom/browser_adapter.js",
      "npm:angular2@2.0.0-alpha.35/src/reflection/reflection.js",
      "npm:angular2@2.0.0-alpha.35/src/dom/dom_adapter.js",
      "npm:angular2@2.0.0-alpha.35/pipes.js",
      "npm:angular2@2.0.0-alpha.35/src/render/dom/compiler/style_inliner.js",
      "npm:angular2@2.0.0-alpha.35/src/render/dom/compiler/view_loader.js",
      "npm:angular2@2.0.0-alpha.35/src/render/dom/compiler/style_url_resolver.js",
      "npm:angular2@2.0.0-alpha.35/src/core/exception_handler.js",
      "npm:angular2@2.0.0-alpha.35/src/core/compiler/view_resolver.js",
      "npm:angular2@2.0.0-alpha.35/src/render/xhr_impl.js",
      "npm:angular2@2.0.0-alpha.35/src/core/compiler/pipe_resolver.js",
      "npm:angular2@2.0.0-alpha.35/src/render/dom/events/event_manager.js",
      "npm:angular2@2.0.0-alpha.35/src/render/dom/events/key_events.js",
      "npm:angular2@2.0.0-alpha.35/src/render/xhr.js",
      "npm:angular2@2.0.0-alpha.35/src/render/dom/events/hammer_gestures.js",
      "npm:angular2@2.0.0-alpha.35/src/core/testability/testability.js",
      "npm:angular2@2.0.0-alpha.35/src/services/anchor_based_app_root_url.js",
      "npm:angular2@2.0.0-alpha.35/src/core/compiler/view_manager_utils.js",
      "npm:angular2@2.0.0-alpha.35/src/core/compiler/proto_view_factory.js",
      "npm:angular2@2.0.0-alpha.35/src/core/compiler/view_pool.js",
      "npm:angular2@2.0.0-alpha.35/src/render/api.js",
      "npm:angular2@2.0.0-alpha.35/src/facade/collection.js",
      "npm:angular2@2.0.0-alpha.35/src/render/dom/view/shared_styles_host.js",
      "npm:angular2@2.0.0-alpha.35/src/render/dom/schema/element_schema_registry.js",
      "npm:angular2@2.0.0-alpha.35/src/profile/wtf_init.js",
      "npm:angular2@2.0.0-alpha.35/src/core/platform_bindings.js",
      "npm:angular2@2.0.0-alpha.35/src/core/compiler/element_injector.js",
      "npm:angular2@2.0.0-alpha.35/src/render/dom/schema/dom_element_schema_registry.js",
      "npm:angular2@2.0.0-alpha.35/src/core/pipes/pipe_binding.js",
      "npm:angular2@2.0.0-alpha.35/src/core/compiler/view_listener.js",
      "npm:angular2@2.0.0-alpha.35/src/core/compiler/view.js",
      "npm:angular2@2.0.0-alpha.35/src/di/type_literal.js",
      "npm:angular2@2.0.0-alpha.35/src/change_detection/pregen_proto_change_detector.js",
      "npm:angular2@2.0.0-alpha.35/src/change_detection/jit_proto_change_detector.js",
      "npm:angular2@2.0.0-alpha.35/src/forms/directives/shared.js",
      "npm:angular2@2.0.0-alpha.35/src/change_detection/differs/iterable_differs.js",
      "npm:angular2@2.0.0-alpha.35/src/change_detection/differs/default_iterable_differ.js",
      "npm:angular2@2.0.0-alpha.35/src/change_detection/differs/default_keyvalue_differ.js",
      "npm:rx@2.5.1.js",
      "npm:angular2@2.0.0-alpha.35/src/change_detection/differs/keyvalue_differs.js",
      "npm:angular2@2.0.0-alpha.35/src/change_detection/parser/lexer.js",
      "npm:angular2@2.0.0-alpha.35/src/change_detection/proto_change_detector.js",
      "npm:angular2@2.0.0-alpha.35/src/change_detection/parser/ast.js",
      "npm:angular2@2.0.0-alpha.35/src/change_detection/parser/parser.js",
      "npm:angular2@2.0.0-alpha.35/src/change_detection/parser/locals.js",
      "npm:angular2@2.0.0-alpha.35/src/change_detection/interfaces.js",
      "npm:angular2@2.0.0-alpha.35/src/change_detection/exceptions.js",
      "npm:angular2@2.0.0-alpha.35/src/change_detection/binding_record.js",
      "npm:angular2@2.0.0-alpha.35/src/change_detection/constants.js",
      "npm:angular2@2.0.0-alpha.35/src/change_detection/directive_record.js",
      "npm:angular2@2.0.0-alpha.35/src/change_detection/change_detection_util.js",
      "npm:angular2@2.0.0-alpha.35/src/change_detection/dynamic_change_detector.js",
      "npm:angular2@2.0.0-alpha.35/src/change_detection/change_detector_ref.js",
      "npm:angular2@2.0.0-alpha.35/src/profile/wtf_impl.js",
      "npm:angular2@2.0.0-alpha.35/src/render/dom/compiler/compiler.js",
      "npm:angular2@2.0.0-alpha.35/src/render/dom/dom_renderer.js",
      "npm:angular2@2.0.0-alpha.35/src/render/dom/template_cloner.js",
      "npm:angular2@2.0.0-alpha.35/src/render/dom/dom_tokens.js",
      "npm:angular2@2.0.0-alpha.35/src/reflection/reflector.js",
      "npm:angular2@2.0.0-alpha.35/src/reflection/reflection_capabilities.js",
      "npm:angular2@2.0.0-alpha.35/src/pipes/uppercase_pipe.js",
      "npm:angular2@2.0.0-alpha.35/src/pipes/lowercase_pipe.js",
      "npm:angular2@2.0.0-alpha.35/src/pipes/json_pipe.js",
      "github:jspm/nodelibs-process@0.1.1/index.js",
      "npm:angular2@2.0.0-alpha.35/src/dom/generic_browser_adapter.js",
      "npm:angular2@2.0.0-alpha.35/src/pipes/date_pipe.js",
      "npm:angular2@2.0.0-alpha.35/src/pipes/async_pipe.js",
      "npm:angular2@2.0.0-alpha.35/src/render/dom/events/hammer_common.js",
      "npm:angular2@2.0.0-alpha.35/src/pipes/default_pipes.js",
      "npm:angular2@2.0.0-alpha.35/src/pipes/number_pipe.js",
      "npm:angular2@2.0.0-alpha.35/src/core/testability/get_testability.js",
      "npm:angular2@2.0.0-alpha.35/src/pipes/limit_to_pipe.js",
      "npm:angular2@2.0.0-alpha.35/src/core/pipes/pipes.js",
      "npm:angular2@2.0.0-alpha.35/src/change_detection/change_detection_jit_generator.js",
      "npm:angular2@2.0.0-alpha.35/src/core/compiler/element_binder.js",
      "npm:angular2@2.0.0-alpha.35/src/change_detection/event_binding.js",
      "npm:angular2@2.0.0-alpha.35/src/change_detection/coalesce.js",
      "npm:angular2@2.0.0-alpha.35/src/change_detection/proto_record.js",
      "npm:rx@2.5.1/index.js",
      "npm:angular2@2.0.0-alpha.35/src/render/dom/compiler/compile_pipeline.js",
      "npm:angular2@2.0.0-alpha.35/src/core/compiler/directive_lifecycle_reflector.js",
      "npm:angular2@2.0.0-alpha.35/src/render/dom/compiler/compile_step_factory.js",
      "npm:angular2@2.0.0-alpha.35/src/render/dom/view/proto_view_merger.js",
      "npm:angular2@2.0.0-alpha.35/src/change_detection/pipe_lifecycle_reflector.js",
      "npm:angular2@2.0.0-alpha.35/src/change_detection/abstract_change_detector.js",
      "npm:angular2@2.0.0-alpha.35/src/render/dom/util.js",
      "npm:angular2@2.0.0-alpha.35/src/render/dom/compiler/selector.js",
      "npm:angular2@2.0.0-alpha.35/src/render/dom/view/fragment.js",
      "npm:angular2@2.0.0-alpha.35/src/render/dom/view/view.js",
      "npm:angular2@2.0.0-alpha.35/src/facade/intl.js",
      "npm:angular2@2.0.0-alpha.35/src/facade/math.js",
      "npm:process@0.10.1.js",
      "npm:angular2@2.0.0-alpha.35/src/change_detection/codegen_name_util.js",
      "npm:rx@2.5.1/dist/rx.js",
      "npm:rx@2.5.1/dist/rx.aggregates.js",
      "npm:angular2@2.0.0-alpha.35/src/render/dom/view/proto_view.js",
      "npm:angular2@2.0.0-alpha.35/src/change_detection/codegen_logic_util.js",
      "npm:rx@2.5.1/dist/rx.binding.js",
      "npm:rx@2.5.1/dist/rx.backpressure.js",
      "npm:rx@2.5.1/dist/rx.async.js",
      "npm:rx@2.5.1/dist/rx.joinpatterns.js",
      "npm:rx@2.5.1/dist/rx.sorting.js",
      "npm:rx@2.5.1/dist/rx.coincidence.js",
      "npm:rx@2.5.1/dist/rx.testing.js",
      "npm:angular2@2.0.0-alpha.35/src/pipes/invalid_pipe_argument_exception.js",
      "npm:rx@2.5.1/dist/rx.experimental.js",
      "npm:angular2@2.0.0-alpha.35/src/render/dom/compiler/compile_control.js",
      "npm:rx@2.5.1/dist/rx.virtualtime.js",
      "npm:angular2@2.0.0-alpha.35/src/render/dom/compiler/property_binding_parser.js",
      "npm:angular2@2.0.0-alpha.35/src/render/dom/compiler/compile_element.js",
      "npm:angular2@2.0.0-alpha.35/src/render/dom/view/proto_view_builder.js",
      "npm:angular2@2.0.0-alpha.35/src/render/dom/compiler/text_interpolation_parser.js",
      "npm:angular2@2.0.0-alpha.35/src/render/dom/compiler/style_encapsulator.js",
      "npm:rx@2.5.1/dist/rx.time.js",
      "npm:angular2@2.0.0-alpha.35/src/render/dom/compiler/directive_parser.js",
      "npm:angular2@2.0.0-alpha.35/src/render/dom/compiler/view_splitter.js",
      "npm:angular2@2.0.0-alpha.35/src/change_detection/observable_facade.js",
      "npm:angular2@2.0.0-alpha.35/src/render/dom/view/element_binder.js",
      "npm:process@0.10.1/browser.js",
      "npm:angular2@2.0.0-alpha.35/src/render/dom/compiler/shadow_css.js",
      "npm:angular2@2.0.0-alpha.35/src/change_detection/codegen_facade.js"
    ]
  },

  packages: {
    "app": {
      "main": "app.ts",
      "defaultExtension": "ts"
    }
  },

  map: {
    "angular2": "npm:angular2@2.0.0-alpha.35",
    "reflect-metadata": "npm:reflect-metadata@0.1.0",
    "traceur-runtime": "github:jmcriffey/bower-traceur-runtime@0.0.91",
    "typescript": "npm:typescript@1.6.0-dev.20150825",
    "github:jspm/nodelibs-assert@0.1.0": {
      "assert": "npm:assert@1.3.0"
    },
    "github:jspm/nodelibs-buffer@0.1.0": {
      "buffer": "npm:buffer@3.4.3"
    },
    "github:jspm/nodelibs-constants@0.1.0": {
      "constants-browserify": "npm:constants-browserify@0.0.1"
    },
    "github:jspm/nodelibs-crypto@0.1.0": {
      "crypto-browserify": "npm:crypto-browserify@3.9.14"
    },
    "github:jspm/nodelibs-events@0.1.1": {
      "events": "npm:events@1.0.2"
    },
    "github:jspm/nodelibs-os@0.1.0": {
      "os-browserify": "npm:os-browserify@0.1.2"
    },
    "github:jspm/nodelibs-path@0.1.0": {
      "path-browserify": "npm:path-browserify@0.0.0"
    },
    "github:jspm/nodelibs-process@0.1.1": {
      "process": "npm:process@0.10.1"
    },
    "github:jspm/nodelibs-stream@0.1.0": {
      "stream-browserify": "npm:stream-browserify@1.0.0"
    },
    "github:jspm/nodelibs-url@0.1.0": {
      "url": "npm:url@0.10.3"
    },
    "github:jspm/nodelibs-util@0.1.0": {
      "util": "npm:util@0.10.3"
    },
    "github:jspm/nodelibs-vm@0.1.0": {
      "vm-browserify": "npm:vm-browserify@0.0.4"
    },
    "npm:angular2@2.0.0-alpha.35": {
      "crypto": "github:jspm/nodelibs-crypto@0.1.0",
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "path": "github:jspm/nodelibs-path@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.1",
      "reflect-metadata": "npm:reflect-metadata@0.1.0",
      "rx": "npm:rx@2.5.1",
      "url": "github:jspm/nodelibs-url@0.1.0",
      "zone.js": "npm:zone.js@0.5.3"
    },
    "npm:asn1.js@2.2.0": {
      "assert": "github:jspm/nodelibs-assert@0.1.0",
      "bn.js": "npm:bn.js@2.2.0",
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "inherits": "npm:inherits@2.0.1",
      "minimalistic-assert": "npm:minimalistic-assert@1.0.0",
      "vm": "github:jspm/nodelibs-vm@0.1.0"
    },
    "npm:assert@1.3.0": {
      "util": "npm:util@0.10.3"
    },
    "npm:browserify-aes@1.0.3": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "buffer-xor": "npm:buffer-xor@1.0.2",
      "create-hash": "npm:create-hash@1.1.1",
      "crypto": "github:jspm/nodelibs-crypto@0.1.0",
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "inherits": "npm:inherits@2.0.1",
      "stream": "github:jspm/nodelibs-stream@0.1.0",
      "systemjs-json": "github:systemjs/plugin-json@0.1.0"
    },
    "npm:browserify-rsa@2.0.1": {
      "bn.js": "npm:bn.js@2.2.0",
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "constants": "github:jspm/nodelibs-constants@0.1.0",
      "crypto": "github:jspm/nodelibs-crypto@0.1.0",
      "randombytes": "npm:randombytes@2.0.1"
    },
    "npm:browserify-sign@3.0.3": {
      "bn.js": "npm:bn.js@2.2.0",
      "browserify-rsa": "npm:browserify-rsa@2.0.1",
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "create-hash": "npm:create-hash@1.1.1",
      "create-hmac": "npm:create-hmac@1.1.3",
      "crypto": "github:jspm/nodelibs-crypto@0.1.0",
      "elliptic": "npm:elliptic@3.1.0",
      "inherits": "npm:inherits@2.0.1",
      "parse-asn1": "npm:parse-asn1@3.0.1",
      "stream": "github:jspm/nodelibs-stream@0.1.0"
    },
    "npm:buffer-xor@1.0.2": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "systemjs-json": "github:systemjs/plugin-json@0.1.0"
    },
    "npm:buffer@3.4.3": {
      "base64-js": "npm:base64-js@0.0.8",
      "ieee754": "npm:ieee754@1.1.6",
      "is-array": "npm:is-array@1.0.1"
    },
    "npm:constants-browserify@0.0.1": {
      "systemjs-json": "github:systemjs/plugin-json@0.1.0"
    },
    "npm:core-util-is@1.0.1": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0"
    },
    "npm:create-ecdh@2.0.1": {
      "bn.js": "npm:bn.js@2.2.0",
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "crypto": "github:jspm/nodelibs-crypto@0.1.0",
      "elliptic": "npm:elliptic@3.1.0"
    },
    "npm:create-hash@1.1.1": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "crypto": "github:jspm/nodelibs-crypto@0.1.0",
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "inherits": "npm:inherits@2.0.1",
      "ripemd160": "npm:ripemd160@1.0.1",
      "sha.js": "npm:sha.js@2.4.2",
      "stream": "github:jspm/nodelibs-stream@0.1.0"
    },
    "npm:create-hmac@1.1.3": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "create-hash": "npm:create-hash@1.1.1",
      "crypto": "github:jspm/nodelibs-crypto@0.1.0",
      "inherits": "npm:inherits@2.0.1",
      "stream": "github:jspm/nodelibs-stream@0.1.0"
    },
    "npm:crypto-browserify@3.9.14": {
      "browserify-aes": "npm:browserify-aes@1.0.3",
      "browserify-sign": "npm:browserify-sign@3.0.3",
      "create-ecdh": "npm:create-ecdh@2.0.1",
      "create-hash": "npm:create-hash@1.1.1",
      "create-hmac": "npm:create-hmac@1.1.3",
      "diffie-hellman": "npm:diffie-hellman@3.0.2",
      "inherits": "npm:inherits@2.0.1",
      "pbkdf2": "npm:pbkdf2@3.0.4",
      "public-encrypt": "npm:public-encrypt@2.0.1",
      "randombytes": "npm:randombytes@2.0.1"
    },
    "npm:diffie-hellman@3.0.2": {
      "bn.js": "npm:bn.js@2.2.0",
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "crypto": "github:jspm/nodelibs-crypto@0.1.0",
      "miller-rabin": "npm:miller-rabin@2.0.1",
      "randombytes": "npm:randombytes@2.0.1",
      "systemjs-json": "github:systemjs/plugin-json@0.1.0"
    },
    "npm:elliptic@3.1.0": {
      "bn.js": "npm:bn.js@2.2.0",
      "brorand": "npm:brorand@1.0.5",
      "hash.js": "npm:hash.js@1.0.3",
      "inherits": "npm:inherits@2.0.1",
      "systemjs-json": "github:systemjs/plugin-json@0.1.0"
    },
    "npm:hash.js@1.0.3": {
      "inherits": "npm:inherits@2.0.1"
    },
    "npm:inherits@2.0.1": {
      "util": "github:jspm/nodelibs-util@0.1.0"
    },
    "npm:miller-rabin@2.0.1": {
      "bn.js": "npm:bn.js@2.2.0",
      "brorand": "npm:brorand@1.0.5"
    },
    "npm:os-browserify@0.1.2": {
      "os": "github:jspm/nodelibs-os@0.1.0"
    },
    "npm:parse-asn1@3.0.1": {
      "asn1.js": "npm:asn1.js@2.2.0",
      "browserify-aes": "npm:browserify-aes@1.0.3",
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "create-hash": "npm:create-hash@1.1.1",
      "pbkdf2": "npm:pbkdf2@3.0.4",
      "systemjs-json": "github:systemjs/plugin-json@0.1.0"
    },
    "npm:path-browserify@0.0.0": {
      "process": "github:jspm/nodelibs-process@0.1.1"
    },
    "npm:pbkdf2@3.0.4": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "child_process": "github:jspm/nodelibs-child_process@0.1.0",
      "create-hmac": "npm:create-hmac@1.1.3",
      "crypto": "github:jspm/nodelibs-crypto@0.1.0",
      "path": "github:jspm/nodelibs-path@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.1",
      "systemjs-json": "github:systemjs/plugin-json@0.1.0"
    },
    "npm:public-encrypt@2.0.1": {
      "bn.js": "npm:bn.js@2.2.0",
      "browserify-rsa": "npm:browserify-rsa@2.0.1",
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "create-hash": "npm:create-hash@1.1.1",
      "crypto": "github:jspm/nodelibs-crypto@0.1.0",
      "parse-asn1": "npm:parse-asn1@3.0.1",
      "randombytes": "npm:randombytes@2.0.1"
    },
    "npm:punycode@1.3.2": {
      "process": "github:jspm/nodelibs-process@0.1.1"
    },
    "npm:randombytes@2.0.1": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "crypto": "github:jspm/nodelibs-crypto@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.1"
    },
    "npm:readable-stream@1.1.13": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "core-util-is": "npm:core-util-is@1.0.1",
      "events": "github:jspm/nodelibs-events@0.1.1",
      "inherits": "npm:inherits@2.0.1",
      "isarray": "npm:isarray@0.0.1",
      "process": "github:jspm/nodelibs-process@0.1.1",
      "stream-browserify": "npm:stream-browserify@1.0.0",
      "string_decoder": "npm:string_decoder@0.10.31"
    },
    "npm:reflect-metadata@0.1.0": {
      "assert": "github:jspm/nodelibs-assert@0.1.0"
    },
    "npm:ripemd160@1.0.1": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.1"
    },
    "npm:rx@2.5.1": {
      "process": "github:jspm/nodelibs-process@0.1.1"
    },
    "npm:sha.js@2.4.2": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "inherits": "npm:inherits@2.0.1",
      "process": "github:jspm/nodelibs-process@0.1.1"
    },
    "npm:stream-browserify@1.0.0": {
      "events": "github:jspm/nodelibs-events@0.1.1",
      "inherits": "npm:inherits@2.0.1",
      "readable-stream": "npm:readable-stream@1.1.13"
    },
    "npm:string_decoder@0.10.31": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0"
    },
    "npm:typescript@1.6.0-dev.20150825": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "child_process": "github:jspm/nodelibs-child_process@0.1.0",
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "os": "github:jspm/nodelibs-os@0.1.0",
      "path": "github:jspm/nodelibs-path@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.1",
      "readline": "github:jspm/nodelibs-readline@0.1.0"
    },
    "npm:url@0.10.3": {
      "assert": "github:jspm/nodelibs-assert@0.1.0",
      "punycode": "npm:punycode@1.3.2",
      "querystring": "npm:querystring@0.2.0",
      "util": "github:jspm/nodelibs-util@0.1.0"
    },
    "npm:util@0.10.3": {
      "inherits": "npm:inherits@2.0.1",
      "process": "github:jspm/nodelibs-process@0.1.1"
    },
    "npm:vm-browserify@0.0.4": {
      "indexof": "npm:indexof@0.0.1"
    },
    "npm:zone.js@0.5.3": {
      "process": "github:jspm/nodelibs-process@0.1.1"
    }
  }
});
