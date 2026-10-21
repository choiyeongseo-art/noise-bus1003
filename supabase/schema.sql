-- NØISE v1 · Run once in the dedicated NOISE project SQL editor.
create table public.game_saves (
 user_id uuid primary key references auth.users(id) on delete cascade,
 state jsonb not null check (jsonb_typeof(state)='object' and octet_length(state::text)<250000),
 revision bigint not null default 1,
 updated_at timestamptz not null default now()
);
alter table public.game_saves enable row level security;
revoke all on public.game_saves from anon;
grant select,insert,update on public.game_saves to authenticated;
create policy "Read own save" on public.game_saves for select to authenticated using ((select auth.uid())=user_id);
create policy "Insert own save" on public.game_saves for insert to authenticated with check ((select auth.uid())=user_id);
create policy "Update own save" on public.game_saves for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create or replace function public.save_game(p_state jsonb,p_revision bigint)
returns jsonb language plpgsql security invoker set search_path=public as $$
declare result jsonb; uid uuid:=auth.uid();
begin
 if uid is null then raise exception 'Authentication required'; end if;
 if jsonb_typeof(p_state) <> 'object' or (p_state->>'version') is distinct from '1' or octet_length(p_state::text)>250000 then raise exception 'Invalid save'; end if;
 if p_revision=0 then
  insert into public.game_saves(user_id,state) values(uid,p_state) on conflict do nothing;
  if not found then raise exception 'SAVE_CONFLICT'; end if;
 else
  update public.game_saves set state=p_state, revision=revision+1, updated_at=now() where user_id=uid and revision=p_revision;
  if not found then raise exception 'SAVE_CONFLICT'; end if;
 end if;
 select jsonb_build_object('revision',revision,'updated_at',updated_at) into result from public.game_saves where user_id=uid;
 return result;
end; $$;
revoke all on function public.save_game(jsonb,bigint) from public,anon;
grant execute on function public.save_game(jsonb,bigint) to authenticated;
