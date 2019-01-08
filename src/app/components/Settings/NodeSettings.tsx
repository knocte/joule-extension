// Huge bastardization of ant design's Transfer component
import React from 'react';
import { connect } from 'react-redux';
import { Form, Input, Button, Icon, Drawer, message } from 'antd';
import { editNodeField, updateNodeUrl, updateMacaroons } from 'modules/node/actions';
import { changePassword, setPassword, cancelChangePassword } from 'modules/crypto/actions';
import CreatePassword from 'components/CreatePassword';
import InputAddress from 'components/SelectNode/InputAddress';
import UploadMacaroons from 'components/SelectNode/UploadMacaroons';
import { AppState } from 'store/reducers';

interface StateProps {
  url: AppState['node']['url'];
  readonlyMacaroon: AppState['node']['readonlyMacaroon'];
  adminMacaroon: AppState['node']['adminMacaroon'];
  isNodeChecked: AppState['node']['isNodeChecked'];
  editingNodeField: AppState['node']['editingNodeField'];
  isUpdatingNodeUrl: AppState['node']['isUpdatingNodeUrl'];
  updateNodeUrlError: AppState['node']['updateNodeUrlError'];
  isUpdatingMacaroons: AppState['node']['isUpdatingMacaroons'];
  updateMacaroonsError: AppState['node']['updateMacaroonsError'];
  isChangingPassword: AppState['crypto']['isChangingPassword'];
}

interface DispatchProps {
  editNodeField: typeof editNodeField;
  updateNodeUrl: typeof updateNodeUrl;
  updateMacaroons: typeof updateMacaroons;
  changePassword: typeof changePassword;
  cancelChangePassword: typeof cancelChangePassword;
  setPassword: typeof setPassword;
}

type Props = StateProps & DispatchProps;

class NodeSettings extends React.Component<Props> {

  componentWillUpdate(nextProps: Props) {
    if (this.props.isNodeChecked !== nextProps.isNodeChecked
        && nextProps.isNodeChecked) {
          message.success(`Connected to ${nextProps.url}`, 2);
    }
  }

  render() {
    const { url, readonlyMacaroon, adminMacaroon, isChangingPassword } = this.props;

    return (
      <>
        <Form.Item label="REST API URL">
          <Input.Group compact className="Settings-input-group">
            <Input
              value={url as string}
              disabled
            />
              <Button onClick={this.editNodeUrl}>
                <Icon type="edit" />
              </Button>
          </Input.Group>
        </Form.Item>
        <Form.Item label="Readonly Macaroon">
          <Input.Group compact className="Settings-input-group">
            <Input
              value={readonlyMacaroon as string}
              disabled
            />
            <Button onClick={this.editMacaroons}>
              <Icon type="edit" />
            </Button>
          </Input.Group>
        </Form.Item>
        <Form.Item label="Admin Macaroon">
          <Input.Group compact className="Settings-input-group">
            <Input
              value={adminMacaroon as string || '<encrypted>'}
              disabled
            />
            <Button onClick={this.editMacaroons}>
              <Icon type="edit" />
            </Button>
          </Input.Group>
        </Form.Item>
        <Form.Item>
          <Button
            type="default"
            size="large"
            block
            onClick={this.props.changePassword}
          >
            Change Password
          </Button>
        </Form.Item>

        <Drawer
          visible={isChangingPassword}
          placement="right"
          onClose={this.props.cancelChangePassword}
          width="92%"
          title="Change your password"
        >
          <CreatePassword onCreatePassword={this.props.setPassword} title="" />
        </Drawer> 

        {this.renderDrawer()}
      
      </>
    )
  }

  private handleMacaroons = (adminMacaroon: string, readonlyMacaroon: string) => {
    const { url } = this.props;
    this.props.updateMacaroons(url as string, adminMacaroon, readonlyMacaroon);
  };

  private renderDrawer = () => {
    const { 
      url,
      adminMacaroon,
      readonlyMacaroon,
      editingNodeField, 
      isUpdatingNodeUrl, 
      updateNodeUrlError,
      isUpdatingMacaroons,
      updateMacaroonsError,
      isChangingPassword,
    } = this.props

    let title;
    let cmp;

    if (isChangingPassword) {
      title = 'Change your password';
      cmp = <CreatePassword onCreatePassword={this.props.setPassword} title="" />;
    } else if (editingNodeField === 'url') {
      title = 'Provide a URL';
      cmp = (
        <InputAddress
          initialUrl={url as string}
          error={updateNodeUrlError}
          isCheckingNode={isUpdatingNodeUrl}
          submitUrl={this.props.updateNodeUrl}
        />      
      );
    } else if (editingNodeField === 'macaroons') {
      title = 'Upload Macaroons';
      cmp = (
        <UploadMacaroons
          onUploaded={this.handleMacaroons}
          isSaving={isUpdatingMacaroons}
          initialAdmin={adminMacaroon || undefined}
          initialReadonly={readonlyMacaroon || undefined}
          error={updateMacaroonsError ? updateMacaroonsError.message : undefined}
        />
      );
    } else {
      return null;
    }

    return (
      <Drawer
        visible={!!editingNodeField}
        placement="right"
        onClose={this.hideDrawer}
        width="92%"
        title={title}
      >
        {cmp}
      </Drawer>      
    )
  };

  private editNodeUrl = () => this.props.editNodeField('url');
  private editMacaroons = () => this.props.editNodeField('macaroons');
  private hideDrawer = () => this.props.isChangingPassword 
    ? this.props.cancelChangePassword : this.props.editNodeField(null);

}

export default connect<StateProps, DispatchProps, {}, AppState>(
  state => ({
    settings: state.settings,
    url: state.node.url,
    readonlyMacaroon: state.node.readonlyMacaroon,
    adminMacaroon: state.node.adminMacaroon,
    isNodeChecked: state.node.isNodeChecked,
    isUpdatingNodeUrl: state.node.isUpdatingNodeUrl,
    updateNodeUrlError: state.node.updateNodeUrlError,
    isUpdatingMacaroons: state.node.isUpdatingMacaroons,
    updateMacaroonsError: state.node.updateMacaroonsError,
    editingNodeField: state.node.editingNodeField,
    isChangingPassword: state.crypto.isChangingPassword,
  }),
  {
    editNodeField,
    updateNodeUrl,
    updateMacaroons,
    changePassword,
    cancelChangePassword,
    setPassword,
  },
)(NodeSettings);