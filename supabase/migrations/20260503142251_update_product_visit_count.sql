create or replace function update_product_visited_counts(products_counts JSONB)
returns VOID 
language plpgsql
as $$
begin
    update "Products" p
    set "visitedCount" = p."visitedCount" + (pc.value)::int
    from jsonb_each_text(products_counts) AS pc(key, value)
    where p.id = (pc.key)::int;
end;
$$;