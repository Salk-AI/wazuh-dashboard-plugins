import React, { useState, useEffect, Fragment } from 'react';
import {
  EuiToolTip,
  EuiButtonIcon,
  EuiButton,
  EuiTitle,
  EuiFormRow,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiText,
  EuiLink,
  EuiPopover,
  EuiButtonEmpty,
  EuiIcon,
  EuiSelect,
  EuiFieldText,
  EuiCodeEditor,
  EuiHorizontalRule,
  EuiComboBox,
  EuiComboBoxOptionOption,
  EuiSpacer,
} from '@elastic/eui';
import {
  getJsonFromRule,
  decodeJsonRule,
  getSelectedUserFromRole,
} from '../helpers/rule-editor.helper';

export const RuleEditor = ({ save, initialRule, isLoading, isReserved, internalUsers }) => {
  const [logicalOperator, setLogicalOperator] = useState('OR');
  const [isLogicalPopoverOpen, setIsLogicalPopoverOpen] = useState(false);
  const [isJsonEditor, setIsJsonEditor] = useState(false);
  const [ruleJson, setRuleJson] = useState('{\n\t\n}');
  const [hasWrongFormat, setHasWrongFormat] = useState(false);
  const default_rule = { user_field: 'username', searchOperation: 'FIND', value: 'wazuh' };
  const [rules, setRules] = useState<any[]>([]);
  const [internalUserRules, setInternalUserRules] = useState<any[]>([]);
  const [internalUsersOptions, setInternalUsersOptions] = useState<EuiComboBoxOptionOption<any>[]>(
    []
  );
  const [selectedUsers, setSelectedUsers] = useState<EuiComboBoxOptionOption<any>[]>([]);
  const searchOperationOptions = [
    { value: 'FIND', text: 'FIND' },
    { value: 'FIND$', text: 'FIND$' },
    { value: 'MATCH', text: 'MATCH' },
    { value: 'MATCH$', text: 'MATCH$' },
  ];

  useEffect(() => {
    if (initialRule) {
      setStateFromRule(JSON.stringify(initialRule));
    }
  }, []);

  useEffect(() => {
    if (internalUsers.length) {
      const users = internalUsers.map(user => ({ label: user.user, id: user.user }));
      setInternalUsersOptions(users);
    }
  }, [internalUsers]);

  const setStateFromRule = jsonRule => {
    const rulesResult = getRulesFromJson(jsonRule);
    if (!rulesResult.wrongFormat) {
      setRules(rulesResult.customeRules);
      setInternalUserRules(rulesResult.internalUsersRules);
      const _selectedUsers = getSelectedUserFromRole(rulesResult.internalUsersRules);
      setSelectedUsers(_selectedUsers);
      setIsJsonEditor(false);
    } else {
      setRuleJson(JSON.stringify(JSON.parse(jsonRule), undefined, 2));
      setIsJsonEditor(true);
    }
  };
  const onButtonClick = () =>
    setIsLogicalPopoverOpen(isLogicalPopoverOpen => !isLogicalPopoverOpen);
  const closeLogicalPopover = () => setIsLogicalPopoverOpen(false);

  const selectOperator = op => {
    setLogicalOperator(op);
    closeLogicalPopover();
  };

  const onSelectorChange = (e, idx) => {
    const rulesTmp = [...rules];
    rulesTmp[idx].searchOperation = e.target.value;
    setRules(rulesTmp);
  };

  const updateUserField = (e, idx) => {
    const rulesTmp = [...rules];
    rulesTmp[idx].user_field = e.target.value;
    setRules(rulesTmp);
  };

  const updateValueField = (e, idx) => {
    const rulesTmp = [...rules];
    rulesTmp[idx].value = e.target.value;
    setRules(rulesTmp);
  };

  const removeRule = id => {
    const rulesTmp = [...rules];
    rulesTmp.splice(id, 1);
    setRules(rulesTmp);
  };

  const getRulesFromJson = jsonRule => {
    const { customeRules, internalUsersRules, wrongFormat, logicalOperator } = decodeJsonRule(
      jsonRule,
      internalUsers
    );
    setLogicalOperator(logicalOperator);
    setHasWrongFormat(wrongFormat);
    return { customeRules, internalUsersRules, wrongFormat, logicalOperator };
  };

  const printRules = () => {
    const rulesList = rules.map((item, idx) => {
      return (
        <Fragment key={`rule_${idx}`}>
          <EuiFlexGroup>
            <EuiFlexItem>
              <EuiFormRow label="User field">
                <EuiFieldText
                  disabled={isLoading || isReserved}
                  placeholder=""
                  value={item.user_field}
                  onChange={e => updateUserField(e, idx)}
                  aria-label=""
                />
              </EuiFormRow>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiFormRow label="Search operation">
                <EuiSelect
                  disabled={isLoading || isReserved}
                  id="selectDocExample"
                  options={searchOperationOptions}
                  value={item.searchOperation}
                  onChange={e => onSelectorChange(e, idx)}
                  aria-label="Use aria labels when no actual label is in use"
                />
              </EuiFormRow>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiFormRow label="Value">
                <EuiFieldText
                  disabled={isLoading || isReserved}
                  placeholder=""
                  value={item.value}
                  onChange={e => updateValueField(e, idx)}
                  aria-label=""
                />
              </EuiFormRow>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButtonIcon
                style={{ marginTop: 25 }}
                onClick={() => removeRule(idx)}
                iconType="trash"
                color="danger"
                aria-label="Remove rule"
              />
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiFlexGroup>
            <EuiFlexItem>
              <EuiHorizontalRule margin="xs" />
            </EuiFlexItem>
          </EuiFlexGroup>
        </Fragment>
      );
    });

    return <div>{rulesList}</div>;
  };

  const addNewRule = () => {
    const rulesTmp = [...rules];
    rulesTmp.push(default_rule);
    setRules(rulesTmp);
  };

  const openJsonEditor = () => {
    const ruleObject = getJsonFromRule(internalUserRules, rules, logicalOperator);
    setRuleJson(JSON.stringify(ruleObject, undefined, 2));
    setIsJsonEditor(true);
  };

  const openVisualEditor = () => {
    setStateFromRule(ruleJson);
  };

  const onChangeRuleJson = e => {
    setRuleJson(e);
    getRulesFromJson(e); // we test format to disable button if it's incorrect
  };

  const getSwitchVisualButton = () => {
    if (hasWrongFormat) {
      return (
        <EuiToolTip position="top" content="Current rule can't be edited using visual editor">
          <EuiButtonEmpty
            color="primary"
            isDisabled={hasWrongFormat}
            onClick={() => openVisualEditor()}
          >
            Switch to visual editor
          </EuiButtonEmpty>
        </EuiToolTip>
      );
    } else {
      return (
        <EuiButtonEmpty color="primary" onClick={() => openVisualEditor()}>
          Switch to visual editor
        </EuiButtonEmpty>
      );
    }
  };

  const saveRule = () => {
    if (isJsonEditor) {
      save(JSON.parse(ruleJson));
    } else {
      save(getJsonFromRule(internalUserRules, rules, logicalOperator));
    }
  };

  const onChangeSelectedUsers = selectedUsers => {
    setSelectedUsers(selectedUsers);
    const tmpInternalUsersRules = selectedUsers.map(user => {
      return { user_field: 'username', searchOperation: 'FIND', value: user.id };
    });
    setInternalUserRules(tmpInternalUsersRules);
  };

  return (
    <>
      <EuiPanel>
        <EuiTitle>
          <h1>Mapping rules</h1>
        </EuiTitle>
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiText>
              <span>Assign roles to users who match these rules. </span>
              <EuiLink
                href="https://documentation.wazuh.com/current/user-manual/api/rbac/auth_context.html"
                external
                target="_blank"
              >
                Learn more
              </EuiLink>
            </EuiText>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiPanel>
              {(isJsonEditor && (
                <EuiCodeEditor
                  // theme="textmate"
                  readOnly={isLoading || isReserved}
                  width="100%"
                  height="250px"
                  value={ruleJson}
                  mode="json"
                  onChange={onChangeRuleJson}
                  wrapEnabled
                  aria-label="Code Editor"
                />
              )) || (
                <Fragment>
                  <EuiTitle size="s">
                    <h2>Map internal users</h2>
                  </EuiTitle>
                  <EuiFormRow
                    label="Internal users"
                    helpText="Assign internal users to the selected role mapping"
                  >
                    <EuiComboBox
                      placeholder="Select internal users"
                      options={internalUsersOptions}
                      selectedOptions={selectedUsers}
                      isLoading={isLoading}
                      onChange={onChangeSelectedUsers}
                      isClearable={true}
                      data-test-subj="demoComboBox"
                    />
                  </EuiFormRow>
                  <EuiSpacer />
                  <EuiTitle size="s">
                    <h2>Custome rules</h2>
                  </EuiTitle>
                  <EuiPopover
                    ownFocus
                    button={
                      <EuiButtonEmpty
                        disabled={isLoading || isReserved}
                        onClick={onButtonClick}
                        iconType="arrowDown"
                        iconSide="right"
                      >
                        {logicalOperator === 'AND' ? 'All are true' : 'Any are true'}
                      </EuiButtonEmpty>
                    }
                    isOpen={isLogicalPopoverOpen}
                    closePopover={closeLogicalPopover}
                    anchorPosition="downCenter"
                  >
                    <div>
                      <EuiFlexGroup>
                        <EuiFlexItem>
                          <EuiButtonEmpty
                            disabled={isLoading || isReserved}
                            color="text"
                            onClick={() => selectOperator('AND')}
                          >
                            {logicalOperator === 'AND' && <EuiIcon type="check" />}All are true
                          </EuiButtonEmpty>
                        </EuiFlexItem>
                      </EuiFlexGroup>
                      <EuiFlexGroup>
                        <EuiFlexItem>
                          <EuiButtonEmpty
                            disabled={isLoading || isReserved}
                            color="text"
                            onClick={() => selectOperator('OR')}
                          >
                            {logicalOperator === 'OR' && <EuiIcon type="check" />}Any are true
                          </EuiButtonEmpty>
                        </EuiFlexItem>
                      </EuiFlexGroup>
                    </div>
                  </EuiPopover>
                  {printRules()}

                  <EuiButtonEmpty
                    disabled={isLoading || isReserved}
                    color="primary"
                    onClick={() => addNewRule()}
                  >
                    Add new rule
                  </EuiButtonEmpty>
                </Fragment>
              )}
            </EuiPanel>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiFlexGroup>
          <EuiFlexItem grow={false}>
            {(isJsonEditor && getSwitchVisualButton()) || (
              <EuiButtonEmpty color="primary" onClick={() => openJsonEditor()}>
                Switch to JSON editor
              </EuiButtonEmpty>
            )}
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPanel>
      <EuiFlexGroup style={{ marginTop: 6 }}>
        <EuiFlexItem></EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton disabled={isReserved} isLoading={isLoading} fill onClick={() => saveRule()}>
            Save role mapping
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
};
