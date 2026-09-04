--
-- PostgreSQL database dump
--

\restrict gLr7kYiczgdrZPmJxizeCOdmKtAetFKRwiaqX3A7hjOX3G2ldXxRob2RHp1ml0R

-- Dumped from database version 18.6 (3484359)
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: aktivitas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.aktivitas (
    id_aktivitas integer NOT NULL,
    id_pemanen character varying(20) NOT NULL,
    id_mandor character varying(20) NOT NULL,
    tanggal date NOT NULL,
    jenis_aktivitas character varying(50) NOT NULL,
    status character varying(20) DEFAULT 'Belum'::character varying,
    CONSTRAINT aktivitas_status_check CHECK (((status)::text = ANY ((ARRAY['Belum'::character varying, 'Berlangsung'::character varying, 'Selesai'::character varying])::text[])))
);


--
-- Name: aktivitas_id_aktivitas_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.aktivitas_id_aktivitas_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: aktivitas_id_aktivitas_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.aktivitas_id_aktivitas_seq OWNED BY public.aktivitas.id_aktivitas;


--
-- Name: akun; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.akun (
    id_karyawan character varying(20) NOT NULL,
    username character varying(20) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(20) NOT NULL,
    CONSTRAINT akun_role_check CHECK (((role)::text = ANY ((ARRAY['admin'::character varying, 'mandor'::character varying, 'pemanen'::character varying])::text[])))
);


--
-- Name: ancak; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ancak (
    id_ancak text NOT NULL,
    id_petak text NOT NULL,
    kode_ancak character varying(20) NOT NULL
);


--
-- Name: detail_aktivitas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.detail_aktivitas (
    id_detail integer NOT NULL,
    id_aktivitas integer NOT NULL,
    id_ancak text NOT NULL,
    jumlah_buah integer DEFAULT 0,
    jumlah_brondol integer DEFAULT 0,
    catatan text
);


--
-- Name: detail_aktivitas_id_detail_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.detail_aktivitas_id_detail_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: detail_aktivitas_id_detail_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.detail_aktivitas_id_detail_seq OWNED BY public.detail_aktivitas.id_detail;


--
-- Name: divisi; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.divisi (
    id_divisi text NOT NULL,
    nama_divisi character varying(50) NOT NULL
);


--
-- Name: foto_detail_aktivitas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.foto_detail_aktivitas (
    id_foto integer NOT NULL,
    id_detail integer NOT NULL,
    url_foto text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: foto_detail_aktivitas_id_foto_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.foto_detail_aktivitas_id_foto_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: foto_detail_aktivitas_id_foto_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.foto_detail_aktivitas_id_foto_seq OWNED BY public.foto_detail_aktivitas.id_foto;


--
-- Name: mandor; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mandor (
    id_mandor character varying(20) NOT NULL,
    id_divisi text NOT NULL,
    nama character varying(100) NOT NULL,
    tanggal_lahir date NOT NULL,
    no_hp character varying(20)
);


--
-- Name: pemanen; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pemanen (
    id_pemanen character varying(20) NOT NULL,
    id_mandor character varying(20) NOT NULL,
    nama character varying(100) NOT NULL,
    tanggal_lahir date NOT NULL,
    no_hp character varying(20)
);


--
-- Name: petak; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.petak (
    id_petak text NOT NULL,
    id_divisi text NOT NULL,
    kode_petak character varying(20) NOT NULL
);


--
-- Name: aktivitas id_aktivitas; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.aktivitas ALTER COLUMN id_aktivitas SET DEFAULT nextval('public.aktivitas_id_aktivitas_seq'::regclass);


--
-- Name: detail_aktivitas id_detail; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.detail_aktivitas ALTER COLUMN id_detail SET DEFAULT nextval('public.detail_aktivitas_id_detail_seq'::regclass);


--
-- Name: foto_detail_aktivitas id_foto; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.foto_detail_aktivitas ALTER COLUMN id_foto SET DEFAULT nextval('public.foto_detail_aktivitas_id_foto_seq'::regclass);


--
-- Name: aktivitas aktivitas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.aktivitas
    ADD CONSTRAINT aktivitas_pkey PRIMARY KEY (id_aktivitas);


--
-- Name: akun akun_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.akun
    ADD CONSTRAINT akun_pkey PRIMARY KEY (id_karyawan);


--
-- Name: akun akun_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.akun
    ADD CONSTRAINT akun_username_key UNIQUE (username);


--
-- Name: ancak ancak_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ancak
    ADD CONSTRAINT ancak_pkey PRIMARY KEY (id_ancak);


--
-- Name: detail_aktivitas detail_aktivitas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.detail_aktivitas
    ADD CONSTRAINT detail_aktivitas_pkey PRIMARY KEY (id_detail);


--
-- Name: divisi divisi_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.divisi
    ADD CONSTRAINT divisi_pkey PRIMARY KEY (id_divisi);


--
-- Name: foto_detail_aktivitas foto_detail_aktivitas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.foto_detail_aktivitas
    ADD CONSTRAINT foto_detail_aktivitas_pkey PRIMARY KEY (id_foto);


--
-- Name: mandor mandor_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mandor
    ADD CONSTRAINT mandor_pkey PRIMARY KEY (id_mandor);


--
-- Name: pemanen pemanen_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pemanen
    ADD CONSTRAINT pemanen_pkey PRIMARY KEY (id_pemanen);


--
-- Name: petak petak_kode_petak_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.petak
    ADD CONSTRAINT petak_kode_petak_key UNIQUE (kode_petak);


--
-- Name: petak petak_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.petak
    ADD CONSTRAINT petak_pkey PRIMARY KEY (id_petak);


--
-- Name: aktivitas aktivitas_id_mandor_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.aktivitas
    ADD CONSTRAINT aktivitas_id_mandor_fkey FOREIGN KEY (id_mandor) REFERENCES public.mandor(id_mandor);


--
-- Name: aktivitas aktivitas_id_pemanen_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.aktivitas
    ADD CONSTRAINT aktivitas_id_pemanen_fkey FOREIGN KEY (id_pemanen) REFERENCES public.pemanen(id_pemanen);


--
-- Name: ancak ancak_id_petak_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ancak
    ADD CONSTRAINT ancak_id_petak_fkey FOREIGN KEY (id_petak) REFERENCES public.petak(id_petak) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: detail_aktivitas detail_aktivitas_id_aktivitas_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.detail_aktivitas
    ADD CONSTRAINT detail_aktivitas_id_aktivitas_fkey FOREIGN KEY (id_aktivitas) REFERENCES public.aktivitas(id_aktivitas) ON DELETE CASCADE;


--
-- Name: detail_aktivitas detail_aktivitas_id_ancak_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.detail_aktivitas
    ADD CONSTRAINT detail_aktivitas_id_ancak_fkey FOREIGN KEY (id_ancak) REFERENCES public.ancak(id_ancak) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: foto_detail_aktivitas foto_detail_aktivitas_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.foto_detail_aktivitas
    ADD CONSTRAINT foto_detail_aktivitas_fkey FOREIGN KEY (id_detail) REFERENCES public.detail_aktivitas(id_detail) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: mandor mandor_id_divisi_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mandor
    ADD CONSTRAINT mandor_id_divisi_fkey FOREIGN KEY (id_divisi) REFERENCES public.divisi(id_divisi);


--
-- Name: mandor mandor_id_mandor_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mandor
    ADD CONSTRAINT mandor_id_mandor_fkey FOREIGN KEY (id_mandor) REFERENCES public.akun(id_karyawan);


--
-- Name: pemanen pemanen_id_mandor_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pemanen
    ADD CONSTRAINT pemanen_id_mandor_fkey FOREIGN KEY (id_mandor) REFERENCES public.mandor(id_mandor);


--
-- Name: pemanen pemanen_id_pemanen_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pemanen
    ADD CONSTRAINT pemanen_id_pemanen_fkey FOREIGN KEY (id_pemanen) REFERENCES public.akun(id_karyawan);


--
-- Name: petak petak_id_divisi_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.petak
    ADD CONSTRAINT petak_id_divisi_fkey FOREIGN KEY (id_divisi) REFERENCES public.divisi(id_divisi);


--
-- PostgreSQL database dump complete
--

\unrestrict gLr7kYiczgdrZPmJxizeCOdmKtAetFKRwiaqX3A7hjOX3G2ldXxRob2RHp1ml0R

