#ifndef COMPILER_HPP
#define COMPILER_HPP

#include <memory>
#include <variant>
#include <vector>
#include <unordered_map>
#include <string>
#include <memory_resource>

// Enums
enum class NodeType { CORE, ADDITIVE, SUBCIRCLE };
enum class CoreElement { FOGO, AGUA, AR, TERRA, LUZ, TREVAS, SOMBRA, CRIACAO, DESTRUICAO };
enum class AdditiveFamily { VETORIAL, MORFOLOGICA, MODULACAO, CONTROLE_TEMPO, COMPORTAMENTAL };
enum class AdditiveType { PONTO, VETOR_LINEAR, RADIACAO, ANCORAGEM, PLANO_SOLIDO, ESFERA_CUPULA, ARESTA_FINA, CADEIA, AMPLIFICADOR, REDUTOR, CAPACITOR, VALVULA, GATILHO_SENSORIAL, ATRASO, SUSTENTACAO, CICLO, ADESAO, REPULSAO, PENETRACAO, ATRACAO, ROMANO_I, ROMANO_II, ROMANO_III, ROMANO_IV, ROMANO_V, ROMANO_X };
enum class EdgeType { UNIAO, ATRIBUICAO, SEQUENCIA, FEEDBACK, AND, OR, NOT, XOR };

// Structs
struct NodeAttributes {
    double lumen = 0;
    double sonic = 0;
    double thermal = 0;
    double olfactory = 0;
    double mass = 0;
    double velocity = 0;
    double density = 0;
    double potency = 0;
    double volatility = 0;
    double complexity = 0;
    double stealth = 0;
};

struct CoreNode {
    std::string id;
    CoreElement element;
    int layer;
    std::vector<std::string> provides;
    NodeAttributes attributes;
};

struct AdditiveNode {
    std::string id;
    AdditiveFamily family;
    AdditiveType additiveType;
    int layer;
    std::vector<std::string> requires;
    std::vector<std::string> provides;
    NodeAttributes attributes;
};

struct SubCircleNode {
    std::string id;
    int layer;
};

struct Node {
    NodeType type;
    std::variant<CoreNode, AdditiveNode, SubCircleNode> data;
};

struct Edge {
    std::string id;
    std::string sourceId;
    std::string targetId;
    EdgeType type;
};

struct MagicGraph {
    std::vector<Node> nodes;
    std::vector<Edge> edges;
};

struct RealityBuffer {
    NodeAttributes finalAttributes;
    std::vector<std::string> tags;
    std::vector<std::string> instabilities;
    std::vector<std::string> auditLog;
    std::string spellName;
    std::string damageOrEffect;
    int level = 1;
    std::string school = "Conjuração";
    std::string castingTime = "1 ação";
    std::string range = "30 pés";
    std::string components = "V, S";
    std::string duration = "Instantâneo";
};

// Classes
class MagicCompiler {
private:
    std::vector<std::string> instabilities;
    std::vector<std::string> auditLog;
    std::pmr::monotonic_buffer_resource arena;

public:
    MagicCompiler();
    RealityBuffer compile(const MagicGraph& graph);
    void validateValence(const MagicGraph& graph);
    NodeAttributes resolveGraph(const MagicGraph& graph);
};

#endif // COMPILER_HPP