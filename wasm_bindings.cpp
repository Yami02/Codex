#include <emscripten/bind.h>
#include <emscripten/val.h>
#include "compiler.hpp"
#include <nlohmann/json.hpp> // Assume included

std::string compileMagic(const std::string& input) {
    try {
        MagicLexer lexer(input);
        auto tokens = lexer.tokenize();
        std::pmr::monotonic_buffer_resource arena(1024 * 1024);
        MagicParser parser(tokens, arena);
        auto graph = parser.parse();

        MagicCompiler compiler;
        RealityBuffer rb = compiler.compile(*graph);

        // Serialize to JSON
        nlohmann::json j;
        j["attributes"] = {
            {"lumen", rb.finalAttributes.lumen},
            {"thermal", rb.finalAttributes.thermal},
            // Add others
        };
        j["tags"] = rb.tags;
        j["instabilities"] = rb.instabilities;
        j["spellName"] = rb.spellName;

        return j.dump();
    } catch (const std::exception& e) {
        return std::string("{\"error\": \"") + e.what() + "\"}";
    }
}

EMSCRIPTEN_BINDINGS(my_module) {
    emscripten::function("compileMagic", &compileMagic);
}