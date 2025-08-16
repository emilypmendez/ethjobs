import Header from '@/components/ui/Header'
import HeroSection from '@/components/ui/HeroSection'
import SearchAndFilters from '../_components/SearchAndFilters'
import JobsList from '@/components/jobs/JobsList'

export default function JobsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <HeroSection />
      <SearchAndFilters />
      <JobsList />
    </div>
  );
}
