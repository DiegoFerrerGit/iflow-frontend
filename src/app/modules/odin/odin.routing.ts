import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../../pages/odin/odin').then(m => m.OdinPageComponent)
  },
  {
    path: 'allocation-details/:id',
    loadComponent: () => import('../../pages/odin/pages/allocation-details/allocation-details.page').then(m => m.AllocationDetailsPage)
  },
  {
    path: 'allocation-details/:id/subcategories/:subCategoryId',
    loadComponent: () => import('../../pages/odin/pages/allocation-details/pages/sub-category-details/sub-category-details.page').then(m => m.SubCategoryDetailsPage)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OdinRoutingModule { }
