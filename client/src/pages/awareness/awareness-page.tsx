import { SingletonWithYearsPage } from "@/components/singleton-with-years-page";
import {
  getAwareness,
  updateAwareness,
  uploadAwarenessDocument,
  getAwarenessByYear,
} from "@/api/core";

export default function AwarenessPage() {
  return (
    <SingletonWithYearsPage
      title="7.3. Consciencialização"
      descriptionLabel="Consciencialização"
      descriptionPlaceholder="Descreva as ações de consciencialização do SGQ..."
      emptyDescriptionText={'Nenhuma descrição definida. Clique em "Editar" para adicionar.'}
      queryKey={["awareness"]}
      fetchFn={getAwareness}
      updateFn={updateAwareness}
      uploadFn={uploadAwarenessDocument}
      yearDetailQueryKey={(yearId: number) => ["awareness", "year", yearId]}
      yearDetailFetchFn={getAwarenessByYear}
      versioned={false}
    />
  );
}