#ifndef AST_HPP
#define AST_HPP

#include <memory>
#include <string>
#include <variant>
#include <vector>
#include <unordered_map>

enum class NodeType { Core, Additive, Connection, SubCircle };
enum class ConnectionOp { Dash, Assign, Contain, Geometry };
enum class StateModifier { Energia, Gas, Liquido, Solido };
enum class EntropyOp { Aumento, Reducao };

struct RealityBuffer {
    float density = 1.0f;
    float entropy_level = 1.0f;
    float inertia = 0.0f;
    float velocity = 0.0f;
    bool is_contained = false;
    bool rigid_collision = false;
    std::vector<std::pair<float, float>> vertices;
    std::unordered_map<std::string, float> attributes;
    std::vector<std::string> tags;
    std::vector<std::string> instabilities;
};

class Node {
public:
    virtual ~Node() = default;
    virtual RealityBuffer evaluate() = 0;
    NodeType type;
};

class CoreNode : public Node {
public:
    std::string id;
    std::string element;
    int layer = 0;
    RealityBuffer evaluate() override {
        RealityBuffer buffer;
        buffer.attributes["core"] = 1.0f;
        return buffer;
    }
};

class AdditiveNode : public Node {
public:
    std::string id;
    std::string family;
    std::string additiveType;
    int layer = 0;
    RealityBuffer evaluate() override {
        RealityBuffer buffer;
        buffer.attributes["additive"] = 1.0f;
        return buffer;
    }
};

class ConnectionNode : public Node {
public:
    ConnectionOp op;
    std::unique_ptr<Node> left;
    std::unique_ptr<Node> right;

    RealityBuffer evaluate() override {
        RealityBuffer leftRes = left->evaluate();
        RealityBuffer rightRes = right->evaluate();

        RealityBuffer result;
        result.density = (leftRes.density + rightRes.density) * 0.5f;
        result.entropy_level = (leftRes.entropy_level + rightRes.entropy_level) * 0.5f;
        result.vertices = leftRes.vertices;
        result.vertices.insert(result.vertices.end(), rightRes.vertices.begin(), rightRes.vertices.end());

        if (op == ConnectionOp::Contain) {
            result.is_contained = true;
        }

        return result;
    }
};

class SubCircleNode : public Node {
public:
    std::string id;
    int layer = 0;
    std::vector<std::unique_ptr<Node>> children;

    RealityBuffer evaluate() override {
        RealityBuffer result;
        for (auto& child : children) {
            RealityBuffer childRes = child->evaluate();
            result.density += childRes.density;
            result.entropy_level += childRes.entropy_level;
            result.vertices.insert(result.vertices.end(), childRes.vertices.begin(), childRes.vertices.end());
        }
        return result;
    }
};

class ContentionNode : public Node {
public:
    std::unique_ptr<Node> left;
    std::unique_ptr<Node> right;

    RealityBuffer evaluate() override {
        RealityBuffer res = left->evaluate();
        res.is_contained = true;
        res.inertia *= 2.0f;
        return res;
    }
};

#endif // AST_HPP