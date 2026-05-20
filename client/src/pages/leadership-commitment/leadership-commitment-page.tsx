import { SingletonWithYearsPage } from "@/components/singleton-with-years-page";
import {
  getLeadershipCommitment,
  updateLeadershipCommitment,
  uploadLeadershipCommitmentDocument,
  getLeadershipCommitmentByYear,
} from "@/api/core";

export default function LeadershipCommitmentPage() {
  return (
    <SingletonWithYearsPage
      title="5.1. Liderança e Compromisso"
      descriptionLabel="Liderança e Compromisso"
      descriptionPlaceholder="Descreva o compromisso da liderança com o SGQ..."
      emptyDescriptionText={'Nenhum compromisso definido. Clique em "Editar" para adicionar.'}
      queryKey={["leadership-commitment"]}
      fetchFn={getLeadershipCommitment}
      updateFn={updateLeadershipCommitment}
      uploadFn={uploadLeadershipCommitmentDocument}
      yearDetailQueryKey={(yearId: number) => ["leadership-commitment", "year", yearId]}
      yearDetailFetchFn={getLeadershipCommitmentByYear}
    />
  );
}