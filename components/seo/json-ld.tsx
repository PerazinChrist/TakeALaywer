/**
 * Injection d'un bloc JSON-LD.
 *
 * `dangerouslySetInnerHTML` est ici la bonne méthode, et non un raccourci :
 * React échapperait `<`, `>` et `&` dans un enfant texte, ce qui produirait un
 * JSON valide à l'œil mais illisible pour les analyseurs. Le contenu ne vient
 * jamais d'une saisie libre — il est construit par `lib/seo/structured-data`.
 *
 * Les séquences `<` sont malgré tout neutralisées : un titre de guide contenant
 * `</script>` fermerait la balise et injecterait le reste dans la page.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
