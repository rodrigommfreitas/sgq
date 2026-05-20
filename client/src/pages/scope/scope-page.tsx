import { SingletonDocumentPage } from "@/components/singleton-document-page";
import { getScope, updateScope, uploadScopeDocument } from "@/api/core";

export default function ScopePage() {
  return (
    <SingletonDocumentPage
      title="4.3. Âmbito do SGQ"
      descriptionLabel="Definição do Âmbito"
      descriptionPlaceholder="Descreva o âmbito do SGQ..."
      emptyDescriptionText={'Nenhuma definição de âmbito definida. Clique em "Editar" para adicionar.'}
      documentCardTitle="Estado do Documento"
      queryKey={["scope"]}
      fetchFn={getScope}
      updateFn={updateScope}
      uploadFn={uploadScopeDocument}
    />
  );
}