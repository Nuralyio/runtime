package com.nuraly.conduit.connector;

import com.fasterxml.jackson.databind.JsonNode;
import com.nuraly.conduit.dto.*;
import jakarta.enterprise.context.ApplicationScoped;
import org.jboss.logging.Logger;

import java.sql.*;
import java.util.*;

/**
 * MySQL database connector implementation.
 */
@ApplicationScoped
public class MySqlConnector implements DatabaseConnector {

    private static final Logger LOG = Logger.getLogger(MySqlConnector.class);

    @Override
    public String getType() {
        return "mysql";
    }

    @Override
    public Connection connect(DatabaseCredential credential) throws SQLException {
        String url = String.format("jdbc:mysql://%s:%d/%s",
                credential.getHost(),
                credential.getPort(),
                credential.getDatabase());

        Properties props = new Properties();
        props.setProperty("user", credential.getUsername());
        props.setProperty("password", credential.getPassword());

        if (Boolean.TRUE.equals(credential.getSsl())) {
            props.setProperty("useSSL", "true");
            props.setProperty("requireSSL", "true");
        }

        if (credential.getConnectionTimeout() != null) {
            props.setProperty("connectTimeout", String.valueOf(credential.getConnectionTimeout()));
        }

        return DriverManager.getConnection(url, props);
    }

    @Override
    public TestConnectionResult testConnection(DatabaseCredential credential) {
        long start = System.currentTimeMillis();
        try (Connection conn = connect(credential)) {
            String version = conn.getMetaData().getDatabaseProductVersion();
            long latency = System.currentTimeMillis() - start;
            return TestConnectionResult.success("MySQL " + version, latency);
        } catch (SQLException e) {
            LOG.warnf("Connection test failed: %s", e.getMessage());
            return TestConnectionResult.failure(e.getMessage());
        }
    }

    @Override
    public List<SchemaDTO> listSchemas(Connection conn) throws SQLException {
        List<SchemaDTO> schemas = new ArrayList<>();

        // In MySQL, schemas = databases
        String sql = """
            SELECT SCHEMA_NAME,
                   (SELECT COUNT(*) FROM information_schema.tables t
                    WHERE t.table_schema = s.schema_name) as table_count
            FROM information_schema.schemata s
            WHERE schema_name NOT IN ('mysql', 'information_schema', 'performance_schema', 'sys')
            ORDER BY schema_name
            """;

        try (Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                schemas.add(SchemaDTO.builder()
                        .name(rs.getString("SCHEMA_NAME"))
                        .tableCount(rs.getInt("table_count"))
                        .build());
            }
        }

        return schemas;
    }

    @Override
    public List<TableDTO> listTables(Connection conn, String schema) throws SQLException {
        List<TableDTO> tables = new ArrayList<>();

        String sql = """
            SELECT table_name, table_type, table_comment
            FROM information_schema.tables
            WHERE table_schema = ?
            ORDER BY table_name
            """;

        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, schema != null ? schema : conn.getCatalog());
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    String tableType = rs.getString("table_type");
                    tables.add(TableDTO.builder()
                            .name(rs.getString("table_name"))
                            .schema(schema)
                            .type(tableType.equals("BASE TABLE") ? "table" : tableType.toLowerCase())
                            .description(rs.getString("table_comment"))
                            .build());
                }
            }
        }

        return tables;
    }

    @Override
    public List<ColumnDTO> getColumns(Connection conn, String schema, String table) throws SQLException {
        List<ColumnDTO> columns = new ArrayList<>();

        String sql = """
            SELECT column_name, data_type, is_nullable, column_default,
                   character_maximum_length, numeric_precision, numeric_scale,
                   ordinal_position, column_key, column_comment
            FROM information_schema.columns
            WHERE table_schema = ? AND table_name = ?
            ORDER BY ordinal_position
            """;

        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, schema != null ? schema : conn.getCatalog());
            stmt.setString(2, table);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    columns.add(ColumnDTO.builder()
                            .name(rs.getString("column_name"))
                            .type(rs.getString("data_type"))
                            .nullable(rs.getString("is_nullable").equals("YES"))
                            .primaryKey(rs.getString("column_key").equals("PRI"))
                            .defaultValue(rs.getString("column_default"))
                            .description(rs.getString("column_comment"))
                            .ordinalPosition(rs.getInt("ordinal_position"))
                            .maxLength(rs.getObject("character_maximum_length") != null ?
                                    rs.getInt("character_maximum_length") : null)
                            .precision(rs.getObject("numeric_precision") != null ?
                                    rs.getInt("numeric_precision") : null)
                            .scale(rs.getObject("numeric_scale") != null ?
                                    rs.getInt("numeric_scale") : null)
                            .build());
                }
            }
        }

        return columns;
    }

    @Override
    public List<RelationshipDTO> getRelationships(Connection conn, String schema, String table) throws SQLException {
        List<RelationshipDTO> relationships = new ArrayList<>();

        String sql = """
            SELECT
                kcu.constraint_name,
                kcu.column_name as source_column,
                kcu.referenced_table_schema as target_schema,
                kcu.referenced_table_name as target_table,
                kcu.referenced_column_name as target_column,
                rc.delete_rule,
                rc.update_rule
            FROM information_schema.key_column_usage kcu
            JOIN information_schema.referential_constraints rc
                ON kcu.constraint_name = rc.constraint_name
                AND kcu.table_schema = rc.constraint_schema
            WHERE kcu.table_schema = ?
                AND kcu.table_name = ?
                AND kcu.referenced_table_name IS NOT NULL
            """;

        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, schema != null ? schema : conn.getCatalog());
            stmt.setString(2, table);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    relationships.add(RelationshipDTO.builder()
                            .name(rs.getString("constraint_name"))
                            .sourceColumn(rs.getString("source_column"))
                            .targetSchema(rs.getString("target_schema"))
                            .targetTable(rs.getString("target_table"))
                            .targetColumn(rs.getString("target_column"))
                            .type("many-to-one")
                            .onDelete(rs.getString("delete_rule"))
                            .onUpdate(rs.getString("update_rule"))
                            .build());
                }
            }
        }

        return relationships;
    }

    @Override
    public QueryResult execute(Connection conn, QueryRequest request) throws SQLException {
        long start = System.currentTimeMillis();

        return switch (request.getOperation().toUpperCase()) {
            case "QUERY" -> executeQuery(conn, request, start);
            case "INSERT" -> executeInsert(conn, request, start);
            case "UPDATE" -> executeUpdate(conn, request, start);
            case "DELETE" -> executeDelete(conn, request, start);
            default -> QueryResult.failure("Unknown operation: " + request.getOperation());
        };
    }

    private QueryResult executeQuery(Connection conn, QueryRequest request, long start) throws SQLException {
        // Build table reference
        StringBuilder tableRef = new StringBuilder();
        if (request.getSchema() != null && !request.getSchema().isEmpty()) {
            tableRef.append(quoteIdentifier(request.getSchema())).append(".");
        }
        tableRef.append(quoteIdentifier(request.getTable()));

        // Build WHERE clause
        List<Object> params = new ArrayList<>();
        String whereClause = "";
        if (request.getFilter() != null) {
            whereClause = buildWhereClause(request.getFilter(), params);
        }

        // Check if pagination is requested
        boolean isPaginated = request.getLimit() != null || request.getOffset() != null;
        Long totalCount = null;

        // Execute COUNT query if paginated
        if (isPaginated) {
            StringBuilder countSql = new StringBuilder("SELECT COUNT(*) FROM ");
            countSql.append(tableRef);
            if (!whereClause.isEmpty()) {
                countSql.append(" WHERE ").append(whereClause);
            }

            LOG.debugf("Executing count query: %s with params: %s", countSql, params);

            try (PreparedStatement countStmt = conn.prepareStatement(countSql.toString())) {
                for (int i = 0; i < params.size(); i++) {
                    countStmt.setObject(i + 1, params.get(i));
                }
                try (ResultSet countRs = countStmt.executeQuery()) {
                    if (countRs.next()) {
                        totalCount = countRs.getLong(1);
                    }
                }
            }
        }

        // Build main SELECT query
        StringBuilder sql = new StringBuilder("SELECT ");

        if (request.getSelect() == null || request.getSelect().isEmpty()) {
            sql.append("*");
        } else {
            sql.append(String.join(", ", request.getSelect().stream()
                    .map(this::quoteIdentifier)
                    .toList()));
        }

        sql.append(" FROM ").append(tableRef);

        if (!whereClause.isEmpty()) {
            sql.append(" WHERE ").append(whereClause);
        }

        if (request.getOrderBy() != null && !request.getOrderBy().isEmpty()) {
            sql.append(" ORDER BY ");
            sql.append(String.join(", ", request.getOrderBy().stream()
                    .map(o -> quoteIdentifier(o.getField()) + " " + (o.getDir() != null ? o.getDir() : "ASC"))
                    .toList()));
        }

        if (request.getLimit() != null) {
            sql.append(" LIMIT ").append(request.getLimit());
        }
        if (request.getOffset() != null) {
            sql.append(" OFFSET ").append(request.getOffset());
        }

        LOG.debugf("Executing query: %s", sql);

        try (PreparedStatement stmt = conn.prepareStatement(sql.toString())) {
            for (int i = 0; i < params.size(); i++) {
                stmt.setObject(i + 1, params.get(i));
            }

            try (ResultSet rs = stmt.executeQuery()) {
                List<Map<String, Object>> rows = new ArrayList<>();
                ResultSetMetaData meta = rs.getMetaData();
                int columnCount = meta.getColumnCount();

                while (rs.next()) {
                    Map<String, Object> row = new LinkedHashMap<>();
                    for (int i = 1; i <= columnCount; i++) {
                        row.put(meta.getColumnName(i), rs.getObject(i));
                    }
                    rows.add(row);
                }

                long executionTime = System.currentTimeMillis() - start;

                if (isPaginated && totalCount != null) {
                    return QueryResult.successPaginated(rows, totalCount, executionTime);
                }
                return QueryResult.success(rows, executionTime);
            }
        }
    }

    private QueryResult executeInsert(Connection conn, QueryRequest request, long start) throws SQLException {
        if (request.getFields() == null || request.getFields().isEmpty()) {
            return QueryResult.failure("No fields provided for INSERT");
        }

        StringBuilder sql = new StringBuilder("INSERT INTO ");
        if (request.getSchema() != null && !request.getSchema().isEmpty()) {
            sql.append(quoteIdentifier(request.getSchema())).append(".");
        }
        sql.append(quoteIdentifier(request.getTable()));

        List<String> columns = new ArrayList<>(request.getFields().keySet());
        List<Object> values = new ArrayList<>(request.getFields().values());

        sql.append(" (");
        sql.append(String.join(", ", columns.stream().map(this::quoteIdentifier).toList()));
        sql.append(") VALUES (");
        sql.append(String.join(", ", columns.stream().map(c -> "?").toList()));
        sql.append(")");

        LOG.debugf("Executing insert: %s", sql);

        try (PreparedStatement stmt = conn.prepareStatement(sql.toString(), Statement.RETURN_GENERATED_KEYS)) {
            for (int i = 0; i < values.size(); i++) {
                stmt.setObject(i + 1, values.get(i));
            }

            int affected = stmt.executeUpdate();

            List<Object> generatedKeys = new ArrayList<>();
            try (ResultSet rs = stmt.getGeneratedKeys()) {
                while (rs.next()) {
                    generatedKeys.add(rs.getObject(1));
                }
            }

            long executionTime = System.currentTimeMillis() - start;
            return QueryResult.successMutation(affected, generatedKeys, executionTime);
        }
    }

    private QueryResult executeUpdate(Connection conn, QueryRequest request, long start) throws SQLException {
        if (request.getFields() == null || request.getFields().isEmpty()) {
            return QueryResult.failure("No fields provided for UPDATE");
        }

        StringBuilder sql = new StringBuilder("UPDATE ");
        if (request.getSchema() != null && !request.getSchema().isEmpty()) {
            sql.append(quoteIdentifier(request.getSchema())).append(".");
        }
        sql.append(quoteIdentifier(request.getTable()));

        List<Object> params = new ArrayList<>();

        sql.append(" SET ");
        List<String> setClauses = new ArrayList<>();
        for (Map.Entry<String, Object> entry : request.getFields().entrySet()) {
            setClauses.add(quoteIdentifier(entry.getKey()) + " = ?");
            params.add(entry.getValue());
        }
        sql.append(String.join(", ", setClauses));

        if (request.getFilter() != null) {
            String whereClause = buildWhereClause(request.getFilter(), params);
            if (!whereClause.isEmpty()) {
                sql.append(" WHERE ").append(whereClause);
            }
        }

        LOG.debugf("Executing update: %s", sql);

        try (PreparedStatement stmt = conn.prepareStatement(sql.toString())) {
            for (int i = 0; i < params.size(); i++) {
                stmt.setObject(i + 1, params.get(i));
            }

            int affected = stmt.executeUpdate();
            long executionTime = System.currentTimeMillis() - start;
            return QueryResult.successMutation(affected, null, executionTime);
        }
    }

    private QueryResult executeDelete(Connection conn, QueryRequest request, long start) throws SQLException {
        StringBuilder sql = new StringBuilder("DELETE FROM ");
        if (request.getSchema() != null && !request.getSchema().isEmpty()) {
            sql.append(quoteIdentifier(request.getSchema())).append(".");
        }
        sql.append(quoteIdentifier(request.getTable()));

        List<Object> params = new ArrayList<>();

        if (request.getFilter() == null) {
            return QueryResult.failure("Filter is required for DELETE operations");
        }

        String whereClause = buildWhereClause(request.getFilter(), params);
        if (whereClause.isEmpty()) {
            return QueryResult.failure("Filter is required for DELETE operations");
        }
        sql.append(" WHERE ").append(whereClause);

        LOG.debugf("Executing delete: %s", sql);

        try (PreparedStatement stmt = conn.prepareStatement(sql.toString())) {
            for (int i = 0; i < params.size(); i++) {
                stmt.setObject(i + 1, params.get(i));
            }

            int affected = stmt.executeUpdate();
            long executionTime = System.currentTimeMillis() - start;
            return QueryResult.successMutation(affected, null, executionTime);
        }
    }

    private String buildWhereClause(JsonNode filter, List<Object> params) {
        if (filter == null || filter.isEmpty()) {
            return "";
        }

        if (filter.has("and") && filter.get("and").isArray()) {
            List<String> conditions = new ArrayList<>();
            for (JsonNode condition : filter.get("and")) {
                String clause = buildCondition(condition, params);
                if (!clause.isEmpty()) {
                    conditions.add(clause);
                }
            }
            return conditions.isEmpty() ? "" : "(" + String.join(" AND ", conditions) + ")";
        }

        if (filter.has("or") && filter.get("or").isArray()) {
            List<String> conditions = new ArrayList<>();
            for (JsonNode condition : filter.get("or")) {
                String clause = buildCondition(condition, params);
                if (!clause.isEmpty()) {
                    conditions.add(clause);
                }
            }
            return conditions.isEmpty() ? "" : "(" + String.join(" OR ", conditions) + ")";
        }

        return buildCondition(filter, params);
    }

    private String buildCondition(JsonNode condition, List<Object> params) {
        if (condition.has("and") || condition.has("or")) {
            return buildWhereClause(condition, params);
        }

        if (!condition.has("field") || !condition.has("op")) {
            return "";
        }

        String field = quoteIdentifier(condition.get("field").asText());
        String op = condition.get("op").asText();

        return switch (op) {
            case "=", "equals" -> {
                params.add(getJsonValue(condition.get("value")));
                yield field + " = ?";
            }
            case "!=", "not_equals" -> {
                params.add(getJsonValue(condition.get("value")));
                yield field + " != ?";
            }
            case ">", "gt" -> {
                params.add(getJsonValue(condition.get("value")));
                yield field + " > ?";
            }
            case ">=", "gte" -> {
                params.add(getJsonValue(condition.get("value")));
                yield field + " >= ?";
            }
            case "<", "lt" -> {
                params.add(getJsonValue(condition.get("value")));
                yield field + " < ?";
            }
            case "<=", "lte" -> {
                params.add(getJsonValue(condition.get("value")));
                yield field + " <= ?";
            }
            case "like", "contains" -> {
                params.add("%" + condition.get("value").asText() + "%");
                yield field + " LIKE ?";
            }
            case "in" -> {
                if (condition.has("value") && condition.get("value").isArray()) {
                    List<String> placeholders = new ArrayList<>();
                    for (JsonNode val : condition.get("value")) {
                        params.add(getJsonValue(val));
                        placeholders.add("?");
                    }
                    yield field + " IN (" + String.join(", ", placeholders) + ")";
                }
                yield "";
            }
            case "notIn", "not_in" -> {
                if (condition.has("value") && condition.get("value").isArray()) {
                    List<String> placeholders = new ArrayList<>();
                    for (JsonNode val : condition.get("value")) {
                        params.add(getJsonValue(val));
                        placeholders.add("?");
                    }
                    yield field + " NOT IN (" + String.join(", ", placeholders) + ")";
                }
                yield "";
            }
            case "isNull", "is_null" -> field + " IS NULL";
            case "isNotNull", "is_not_null" -> field + " IS NOT NULL";
            default -> "";
        };
    }

    private Object getJsonValue(JsonNode node) {
        if (node == null || node.isNull()) {
            return null;
        }
        if (node.isNumber()) {
            if (node.isInt()) return node.asInt();
            if (node.isLong()) return node.asLong();
            return node.asDouble();
        }
        if (node.isBoolean()) {
            return node.asBoolean();
        }
        return node.asText();
    }

    private String quoteIdentifier(String identifier) {
        return "`" + identifier.replace("`", "``") + "`";
    }
}
