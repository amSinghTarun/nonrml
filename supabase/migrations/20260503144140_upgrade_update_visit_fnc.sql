CREATE OR REPLACE FUNCTION update_product_visited_count(products_counts JSONB)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    result JSONB;
BEGIN
    WITH updated AS (
        UPDATE "Products"
        SET "visitedCount" = "visitedCount" + (pc.value)::int
        FROM jsonb_each_text(products_counts) AS pc(key, value)
        WHERE "Products".id = (pc.key)::int
        RETURNING "Products".id, "Products"."visitedCount"
    )
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', id,
            'visitedCount', "visitedCount"
        )
    )
    INTO result
    FROM updated;

    RETURN result;
END;
$$;