CREATE OR REPLACE FUNCTION update_product_visited_counts(products_counts JSONB)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', p.id,
            'visitedCount', p."visitedCount"
        )
    )
    INTO result
    FROM (
        UPDATE "Products" p
        SET "visitedCount" = p."visitedCount" + (pc.value)::int
        FROM jsonb_each_text(products_counts) AS pc(key, value)
        WHERE p.id = (pc.key)::int
        RETURNING p.id, p."visitedCount"
    ) p;

    RETURN result;
END;
$$;