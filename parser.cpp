#include "compiler.hpp"
#include <iostream>
#include <sstream>
#include <regex>

// Tokens
enum class TokenType { IDENTIFIER, LAYER_SHIFT, AND, OR, XOR, L_PAREN, R_PAREN, L_BRACKET, R_BRACKET, IMPLICATION, EOF };

struct Token {
    TokenType type;
    std::string value;
};

class MagicLexer {
private:
    std::string input;
    size_t pos = 0;

public:
    MagicLexer(const std::string& in) : input(in) {}

    std::vector<Token> tokenize() {
        std::vector<Token> tokens;
        while (pos < input.size()) {
            char c = input[pos];
            if (isspace(c)) {
                pos++;
                continue;
            }
            if (isalpha(c) || c == '_') {
                tokens.push_back({TokenType::IDENTIFIER, readIdentifier()});
            } else if (c == '>') {
                if (peek(1) == '>') {
                    pos += 2;
                    tokens.push_back({TokenType::LAYER_SHIFT, ">>"});
                } else {
                    // Handle other > cases
                    pos++;
                }
            } else if (c == '&') {
                pos++;
                tokens.push_back({TokenType::AND, "&"});
            } else if (c == '|') {
                pos++;
                tokens.push_back({TokenType::OR, "|"});
            } else if (c == '^') {
                pos++;
                tokens.push_back({TokenType::XOR, "^"});
            } else if (c == '(') {
                pos++;
                tokens.push_back({TokenType::L_PAREN, "("});
            } else if (c == ')') {
                pos++;
                tokens.push_back({TokenType::R_PAREN, ")"});
            } else if (c == '[') {
                pos++;
                tokens.push_back({TokenType::L_BRACKET, "["});
            } else if (c == ']') {
                pos++;
                tokens.push_back({TokenType::R_BRACKET, "]"});
            } else if (c == '-') {
                if (peek(1) == '>') {
                    pos += 2;
                    tokens.push_back({TokenType::IMPLICATION, "->"});
                } else {
                    pos++;
                }
            } else {
                pos++;
            }
        }
        tokens.push_back({TokenType::EOF, ""});
        return tokens;
    }

private:
    char peek(size_t offset = 0) {
        size_t idx = pos + offset;
        return idx < input.size() ? input[idx] : '\0';
    }

    std::string readIdentifier() {
        size_t start = pos;
        while (pos < input.size() && (isalnum(input[pos]) || input[pos] == '_')) {
            pos++;
        }
        return input.substr(start, pos - start);
    }
};

class MagicParser {
private:
    std::vector<Token> tokens;
    size_t current = 0;
    std::pmr::monotonic_buffer_resource& arena;

public:
    MagicParser(const std::vector<Token>& t, std::pmr::monotonic_buffer_resource& a) : tokens(t), arena(a) {}

    std::unique_ptr<MagicGraph> parse() {
        auto graph = std::make_unique<MagicGraph>();
        expression(*graph);
        return graph;
    }

private:
    void expression(MagicGraph& graph) {
        term(graph);
        while (!isAtEnd() && (match(TokenType::LAYER_SHIFT) || match(TokenType::AND) || match(TokenType::OR) || match(TokenType::XOR) || match(TokenType::IMPLICATION))) {
            TokenType op = previous().type;
            term(graph);
            // Add edge based on op
            // Simplified: assume nodes are added in term()
        }
    }

    void term(MagicGraph& graph) {
        if (match(TokenType::IDENTIFIER)) {
            // Add node
            Node node;
            node.type = NodeType::CORE;
            CoreNode core;
            core.id = "node_" + std::to_string(graph.nodes.size());
            core.element = parseElement(previous().value);
            graph.nodes.push_back(node);
        } else if (match(TokenType::L_PAREN)) {
            expression(graph);
            consume(TokenType::R_PAREN, "Expect ')' after expression.");
        } else if (match(TokenType::L_BRACKET)) {
            expression(graph);
            consume(TokenType::R_BRACKET, "Expect ']' after expression.");
        }
    }

    CoreElement parseElement(const std::string& str) {
        if (str == "FOGO") return CoreElement::FOGO;
        // Add others
        return CoreElement::FOGO; // Default
    }

    bool match(TokenType type) {
        if (check(type)) {
            advance();
            return true;
        }
        return false;
    }

    bool check(TokenType type) {
        if (isAtEnd()) return false;
        return tokens[current].type == type;
    }

    Token advance() {
        if (!isAtEnd()) current++;
        return previous();
    }

    Token previous() {
        return tokens[current - 1];
    }

    bool isAtEnd() {
        return current >= tokens.size() || tokens[current].type == TokenType::EOF;
    }

    Token consume(TokenType type, const std::string& message) {
        if (check(type)) return advance();
        throw std::runtime_error(message);
    }
};

// Compiler implementation
MagicCompiler::MagicCompiler() : arena(1024 * 1024) {} // 1MB arena

RealityBuffer MagicCompiler::compile(const MagicGraph& graph) {
    instabilities.clear();
    auditLog.clear();

    validateValence(graph);
    NodeAttributes attrs = resolveGraph(graph);

    RealityBuffer rb;
    rb.finalAttributes = attrs;
    // Add more logic

    return rb;
}

void MagicCompiler::validateValence(const MagicGraph& graph) {
    // Validation logic
}

NodeAttributes MagicCompiler::resolveGraph(const MagicGraph& graph) {
    NodeAttributes attrs;
    for (const auto& node : graph.nodes) {
        if (node.type == NodeType::CORE) {
            const auto& core = std::get<CoreNode>(node.data);
            switch (core.element) {
                case CoreElement::FOGO:
                    attrs.thermal += 3;
                    attrs.lumen += 1;
                    break;
                case CoreElement::AGUA:
                    attrs.mass += 2;
                    break;
                // Add others
            }
        }
    }

    // Entropia
    attrs.complexity = graph.nodes.size() * graph.edges.size();

    // Estados de matéria
    if (attrs.density < 1) {
        attrs.tags.push_back("Gasoso");
    } else if (attrs.density < 2) {
        attrs.tags.push_back("Liquido");
    } else {
        attrs.tags.push_back("Solido");
    }

    return attrs;
}