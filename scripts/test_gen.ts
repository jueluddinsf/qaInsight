import { service } from '../app/lib/service/index';
async function run() {
  try {
    await service.generateReport(["f15bf747-8664-4805-99f9-708fdddde782"], { project: 'regression' });
    console.log("Success");
  } catch(e: any) {
    console.error(e.stack);
  }
}
run();
