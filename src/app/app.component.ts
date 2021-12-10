import { Component, Input } from '@angular/core';
import { faAngleUp, faAngleDown } from '@fortawesome/free-solid-svg-icons';
import { faCoffee } from '@fortawesome/free-solid-svg-icons';
export enum InputType {
  Date = 'Date',
  Text = 'Text',
  TextArea = 'TextArea',
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  readonly InputType = InputType;
  faAngleUp = faAngleUp;
  faAngleDown = faAngleDown;
  faCoffee = faCoffee;
  testCodeValue = `SELECT
o.tenantName,
hist.actionTime,
hist.userId,
v.visitNumber,
v.admitDate,
v.ecdNo,
v.dischargeDate,
CASE WHEN IFMISSINGORNULL(v.drgCode, "") != "" AND IFMISSINGORNULL(o.opportunityType, 1) IN [2,4,5] AND IFMISSINGORNULL(v.soi, "") != "" THEN v.drgCode || "-" || v.soi ELSE v.drgCode END AS drgCode,
hist.action,
hist.comments,
o.\`value\` AS opportunityValue,
o.state AS opportunityState,
o.rebillState AS opportunityRebillState,
IFMISSINGORNULL(o.opportunityId, "001") AS opportunityId,
o.opportunityType AS opportunityType,
v.billDateOriginal,
v.billDateLatest,
v.billStatus,
v.facilityCode,
v.finalCoder,
v.phyAttendingName,
v.patientMedicalRecordNumber,
o.description AS opportunityDescription,
o.timelyFilingEndDate,
case when o.timelyFilingEndDate is VALUED and o.opportunityType == 11 and $leadDaysHB != 0
           THEN  DATE_DIFF_STR(o.timelyFilingEndDate, NOW_UTC(), 'day') - $leadDaysHB
           ELSE
             case when o.timelyFilingEndDate is VALUED and o.opportunityType == 12 and $leadDaysPB != 0
                THEN  DATE_DIFF_STR(o.timelyFilingEndDate, NOW_UTC(), 'day') - $leadDaysPB
                ELSE NULL
           END
         END as leadDaysRemaining,
CASE WHEN IFMISSINGORNULL(o.cmSuggestedDrg, "") = "" THEN o.suggestedDrg ELSE o.cmSuggestedDrg END AS originalSuggestedDrg,
v.patientName,
v.primaryInsName,
v.dischargeDepartment,
o.createdBy,
o.inFlowDate AS inflowDate,
o.reviewedByUserId,
o.reviewedByTeamLeadUserId,
o.assignedDepartment,
o.flaggingLocations,
o.flaggingPhysicians,
v.timelyFilingDays,
v.primaryInsCategory,
CASE WHEN IFMISSINGORNULL(o.opportunityType, 1) = 1 OR IFMISSINGORNULL(o.opportunityType, 1) = 2 OR IFMISSINGORNULL(o.opportunityType, 1) = 5 THEN o.originalDrg ELSE "0" END AS originalDrg,
CASE WHEN IFMISSINGORNULL(o.opportunityType, 1) = 1 OR IFMISSINGORNULL(o.opportunityType, 1) = 2 OR IFMISSINGORNULL(o.opportunityType, 1) = 5 THEN o.weightShift ELSE "0" END AS weightShift,
CASE WHEN IFMISSINGORNULL(o.opportunityType, 1) = 1 OR IFMISSINGORNULL(o.opportunityType, 1) = 2 OR IFMISSINGORNULL(o.opportunityType, 1) = 5 THEN o.suggestedDrg ELSE "0" END AS suggestedDrg,
CASE WHEN IFMISSINGORNULL(o.opportunityType, 1) = 1 OR IFMISSINGORNULL(o.opportunityType, 1) = 2 OR IFMISSINGORNULL(o.opportunityType, 1) = 5 THEN o.category ELSE "" END AS category,
IFMISSINGORNULL(o.billHold.state, "") AS billHoldState,
parentDept.name as assignedParentDepartmentName,
deptName.departmentName as assignedDepartmentName
from \`app\` o
UNNEST o.history hist
JOIN cloud_med v ON KEYS o.visitDocId
LEFT OUTER JOIN app parentDept on keys "physicianParentDepartment-" || o.tenantName || "-" || o.assignedDepartment
LEFT OUTER JOIN app deptName on keys "physicianAssignedDepartment-" || o.tenantName || "-" || o.assignedDepartment
WHERE o.type = "opp"
AND o.tenantName = $tenantName
AND o.state NOT IN $opportunityStatesToHide
AND ANY hists IN o.history SATISFIES hists.actionTime BETWEEN $startactiontime AND $endactiontime END
AND hist.actionTime BETWEEN $startactiontime AND $endactiontime
AND hist.userId IN $userids
AND CASE WHEN $userOppTypes IS NULL THEN true ELSE (o.opportunityType in $userOppTypes) END`;
  editorOptions = { theme: 'vs-dark', language: 'mysql' };
  code: string = this.testCodeValue;
  parameters: { name: string; value: string; inputType: InputType }[] = [];
  isCollapsed = true;
  getVariables() {
    this.parameters = [];
    console.log(this.code);
    const resultArray = this.code.match(/(\$\S+\b)/gi);
    if (resultArray && resultArray.length > 0) {
      let resultSet = new Set(resultArray);
      resultSet.forEach((param) => {
        this.parameters?.push({
          name: param,
          value: '',
          inputType: InputType.Text,
        });
      });
    }
  }
  applyValues() {
    this.parameters.forEach((param) => {
      if (param.inputType == InputType.Date) {
        //date
        let date = (param.value as any).toISOString();
        this.code = this.code.replace(param.name, `"${date}"`);
      } else if (param.value.indexOf('[') == 0) {
        //array
        this.code = this.code.replace(param.name, param.value);
      } else {
        //string
        this.code = this.code.replace(param.name, `"${param.value}"`);
      }
    });
  }
  logParameters() {
    console.log('parameters: ', this.parameters);
  }
}
