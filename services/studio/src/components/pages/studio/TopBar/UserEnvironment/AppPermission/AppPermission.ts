import {
    closeShareApplicationModalAction,
    loadApplicationPermissionAction,
    resetPermissionMessage,
    showShareApplicationModalAction
  } from '$store/actions/app';
  
  import {
    $applicationPermission,
    $currentApplication,
    $permissionsState,
    $showShareApplicationModal
  } from '$store/apps';
import { addPermission } from '$store/handlers/applications/handler';
import "@hybridui/modal";
  
  import { LitElement, html, css, nothing } from 'lit';
  import { customElement, state } from 'lit/decorators.js';
  
  @customElement('app-permission')
  export class AppPermission extends LitElement {
  
    @state() permissions: any = [];
    @state() currentSharePermission: any = "application::read";
    @state() usersInfo: any = [];
    @state() displayModal: boolean = false;
    @state() userEmailAddress: string = '';
    @state() isEmailValid: boolean = true;
  
    static styles = [
      css`
        .share-button {
          width: 89px;
          display: block;
          margin-top: 3px;
        }
  
        .invalid-email {
          border: 1px solid red;
        }
      `
    ];
    @state() inputSubmitted: boolean;
    @state() userIsNotFound: any;
    @state()  permissionsState: any;
    @state() currentApplication: any;
    @state() ownerShip : boolean;
  
    private fetchApplicationPermissions(uuid: any) {
      loadApplicationPermissionAction(uuid, 'application');
    }
  
    connectedCallback() {
      super.connectedCallback();
        this.fetchOwnershipCheck();

  
      $showShareApplicationModal.subscribe((showShareApplicationModal) => {
        this.displayModal = showShareApplicationModal;
      });
  
      $currentApplication.subscribe((currentApplication) => {
        this.currentApplication = currentApplication;
        if (this.currentApplication) {
          this.fetchApplicationPermissions(currentApplication.uuid);
        }
      });
  
      $applicationPermission.subscribe((permissions: any) => {
        if (Array.isArray(permissions)) {
          this.permissions = permissions;
          
          const userIds = new Set(permissions.filter((p: any) => p.user_id).map((p: any) => p.user_id));
          const usersIdsArray = Array.from(userIds);
  
          fetch('/api/permissions/keycloak-users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_ids: usersIdsArray })
          }).then((res) => res.json()).then((res) => this.usersInfo = res.users).catch((err) =>{
            
            console.error(err)});
        }
      });
      $permissionsState.subscribe((permissionsState) => {
        this.permissionsState = permissionsState;
        if (this.currentApplication) {
            this.fetchApplicationPermissions(this.currentApplication.uuid);
          }
      })
      
    }
  
    hasPermission(permission: any) {
      return permission && permission.length > 0 && this.permissions?.find((p: any) => p.permission_type === permission);
    }
  
    getUserInfo(userId: any) {
      return this.usersInfo && this.usersInfo?.find((u: any) => u.id === userId);
    }
  
    getUsersByPermission(permission: any) {
      return this.permissions?.filter((p: any) => p.permission_type === permission);
    }
  
    renderPermissionUserInfo(permission: any) {
      const userInfo = this.getUserInfo(permission.user_id);
      return html`
        <div>
          ${userInfo?.username} ${userInfo?.firstName?  html`: ${userInfo?.firstName}` : nothing} ${userInfo?.lastName?  html`${userInfo?.lastName}` : nothing} ${this.ownerShip ? html`<hy-button @click=${()=>{ 
           /* the fetch is a post request to /api/permissions to delete the permission with
            this body example
            {
  "permission_type": "string",
  "resource_id": "string",
  "resource_type": "string",
  "user_id": "string"
}
           */
          fetch('/api/permissions', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              permission_type: permission.permission_type,
              resource_id: permission.resource_id,
              resource_type: permission.resource_type,
              user_id: permission.user_id
            })
            }).then((res) => res.json()).then((res) => {
                
                this.fetchApplicationPermissions(this.currentApplication.uuid);

            }).catch((err) =>{
                console.error(err)}
            )}
            } icon="remove"></hy-button>` : nothing
          }
        </div>
      `;
    }
  
    validateEmail(email: string) {
      // Regular expression for basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }
  
    handleEmailChange(e: any) {
      const userEmail = e.detail.value;
      this.userEmailAddress = userEmail;
      this.isEmailValid = this.validateEmail(userEmail);
      this.userIsNotFound = false;
      
    }
    // create function that fetch /api/ownership-check/me/{resource_id}/{resource_type} to check if the user is the owner of the application
    
    fetchOwnershipCheck(){
        fetch(`/api/ownership-check/me/${$currentApplication.get().uuid}/application`, {
            method: "GET",
            headers: {
            'Content-Type': 'application/json'
            },
        }).then(res => res.json())
            .then((res) => {
            this.ownerShip = res.im_owner;
            
            })
        }
    renderAddPermission() {
      return html`
        <div style="display: flex">
          <hy-input
            .value=${this.userEmailAddress}
            @valueChange=${this.handleEmailChange}
            style="width: 60%"
            placeholder="Email"
            type="email"
          ></hy-input>
          
  
          <hy-dropdown
            @change=${(e: any) => {
              this.currentSharePermission = e.detail.value.value;
              resetPermissionMessage();
            }}
            .options=${
              [
                { label: 'Read', value: 'application::read' },
                { label: 'Write', value: 'application::write' },
              ]
            }
          >
            <hy-button
              style="width: 94px; display: block;"
              slot="label"
              icon="angle-down"
            >
              ${this.currentSharePermission
              .replace('application::', '').toUpperCase()}
            </hy-button>
          </hy-dropdown>
  
          <hy-button
            icon="share"
            style="width: 96px; display: block;"
            @click=${() => {
                resetPermissionMessage()
                this.inputSubmitted = true;
              if (this.isEmailValid) {
                
                this.checkIfUserExists(this.userEmailAddress);
              } else {
                // Display red message or handle invalid email
                console.error('Invalid email address');
              }
            }}
          >
            Share
          </hy-button>
        </div>
            ${ this.permissionsState?.message ? html`<div style="color: green">${this.permissionsState?.message}</div>` : nothing}
        ${!this.isEmailValid && this.inputSubmitted ? html`<div style="color: red">Invalid email address</div>` : nothing}
        ${this.userIsNotFound ? html`<div style="color: red">User not found</div>` : nothing}

      `;
    }
  
    renderPermissionData() {
      return html`
        ${this.renderAddPermission()}
  
        <h3>Read</h3>
        ${this.getUsersByPermission('application::read').map((permission: any) => {
          return this.renderPermissionUserInfo(permission);
        })}
  
        ${this.getUsersByPermission('application::write')?.length ? html`<h3>Edit</h3>` : nothing}
        ${this.getUsersByPermission('application::write').map((permission: any) => {
          return this.renderPermissionUserInfo(permission);
        })}
  
      `;
    }

    async checkIfUserExists(email: string) {
        const res = await fetch('/api/permissions/keycloak-users/mail', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, exact: true })
        });
        const result = await res.json();
        if(result.error){
            this.userIsNotFound = true;
            this.requestUpdate();   
        }else{
            
            const {user } = result;
            

            addPermission({
                resource_id: $currentApplication.get().uuid,
                resource_type: 'application',
                user_id: user.id,
                permission_type: this.currentSharePermission
            });
            this.userIsNotFound = false;
            this.requestUpdate();   
        }
    }
  
    override render() {
      return html`
        <hy-button
          @click=${() => { showShareApplicationModalAction() }}
          icon="share"
          class="share-button"
          .label=${"share"}
        >
        </hy-button>
  
        <modal-component
          label="Share"
          ?isOpen=${this.displayModal}
          @close=${() => { closeShareApplicationModalAction() }}
        >
          ${this.renderPermissionData()}
        </modal-component>
      `;
    }
  }
  