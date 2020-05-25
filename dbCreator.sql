create schema public;

comment on schema public is 'standard public schema';

alter schema public owner to postgres;

create table customer
(
	id char(20) default random_string(20) not null
		constraint customer_pk
			primary key,
	name text not null
);

alter table customer owner to postgres;

create unique index customer_id_uindex
	on customer (id);

create table domain
(
	domain text not null
		constraint domains_pk
			primary key,
	customer_id char(20) not null
		constraint domains_customer_id
			references customer
				on update cascade on delete restrict
);

alter table domain owner to postgres;

create unique index domains_domain_uindex
	on domain (domain);

create table "user"
(
	email text not null
		constraint user_pk
			primary key,
	domain text not null
		constraint user_domain_domain_fk
			references domain
				on update cascade on delete restrict,
	google_token text not null,
	customer_admin boolean default false not null
);

alter table "user" owner to postgres;

create unique index user_email_uindex
	on "user" (email);

create table blueprint
(
	google_docs_id text not null,
	user_email text
		constraint blueprint_user_email_fk
			references "user"
				on update cascade on delete restrict,
	id bigserial not null
		constraint blueprint_pk
			primary key
);

alter table blueprint owner to postgres;

create unique index blueprint_google_docs_id_user_email_uindex
	on blueprint (google_docs_id, user_email);

create unique index blueprint_id_uindex
	on blueprint (id);

create table blueprint_field
(
	id bigserial not null
		constraint blueprint_field_pk
			primary key,
	blueprint_id bigserial not null
		constraint blueprint_field_blueprint_id_fk
			references blueprint
				on update cascade on delete restrict,
	name text not null,
	type text not null
);

alter table blueprint_field owner to postgres;

create unique index blueprint_field_id_uindex
	on blueprint_field (id);

create table document
(
	id bigserial not null
		constraint document_pk
			primary key,
	google_docs_id text not null,
	blueprint_id bigserial not null
		constraint document_blueprint_id_fk
			references blueprint
				on update cascade on delete restrict,
	created_at timestamp default now() not null
);

alter table document owner to postgres;

create unique index document_id_uindex
	on document (id);

create function random_string(randomlength integer) returns text
	leakproof
	strict
	language sql
as $$
SELECT array_to_string(
               ARRAY(
                       SELECT substring(
                                      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
                                      trunc(random()*62)::int+1,
                                      1
                                  )
                       FROM generate_series(1,randomLength) AS gs(x)
                   )
           , ''
           )
$$;

alter function random_string(integer) owner to postgres;

