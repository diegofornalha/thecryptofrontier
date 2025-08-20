/**
 * Tipos e enums compartilhados para agentes
 * Arquivo separado para evitar dependências circulares
 */
export var AgentType;
(function (AgentType) {
    AgentType["RESEARCHER"] = "researcher";
    AgentType["IMPLEMENTER"] = "implementer";
    AgentType["ANALYST"] = "analyst";
    AgentType["COORDINATOR"] = "coordinator";
    AgentType["CUSTOM"] = "custom";
})(AgentType || (AgentType = {}));
export var AgentStatus;
(function (AgentStatus) {
    AgentStatus["IDLE"] = "idle";
    AgentStatus["WORKING"] = "working";
    AgentStatus["WAITING"] = "waiting";
    AgentStatus["ERROR"] = "error";
})(AgentStatus || (AgentStatus = {}));
