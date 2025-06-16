
-- Script SQL para forçar permissões no banco
-- Use apenas se as outras opções falharem

-- Buscar o ID do role Public
SELECT id, name, type FROM up_roles WHERE type = 'public';

-- Buscar o ID da permissão de criar posts
SELECT id, action FROM up_permissions 
WHERE action = 'api::post.post.create';

-- Conectar role Public com permissão de criar
-- SUBSTITUA OS IDS pelos valores reais
-- INSERT INTO up_permissions_role_links (permission_id, role_id) 
-- VALUES (<permission_id>, <public_role_id>);

-- Verificar se funcionou
SELECT p.*, r.name as role_name 
FROM up_permissions p
JOIN up_permissions_role_links prl ON p.id = prl.permission_id
JOIN up_roles r ON prl.role_id = r.id
WHERE r.type = 'public' AND p.action LIKE '%post%';
